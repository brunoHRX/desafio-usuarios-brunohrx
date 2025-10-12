using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using desafio_usuarios_brunohrx.Data;


namespace desafio_usuarios_brunohrx.Controllers;

[Authorize]
[ApiController]
[ApiVersion("1")]
[Route("api/v{version:apiVersion}/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsersController(AppDbContext context) => _context = context;

    // GET /users?page=&pageSize=&search=
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<UserSummary>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken ct = default)
    {
        var q = _context.Usuarios.AsNoTracking(); // filtro global ativo aplicado


        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(u => u.usuario.ToLower().Contains(s) || u.email.ToLower().Contains(s));
        }


        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(u => u.usuario)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(u => new UserSummary { id = u.id, usuario = u.usuario, email = u.email, ativo = u.ativo, rowVersion = u.RowVersion })
        .ToListAsync(ct);


        return Ok(new PagedResult<UserSummary>(items, total, page, pageSize));
    }

    // GET /users/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var u = await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(x => x.id == id, ct);
        if (u is null) return NotFound();
        return Ok(new UserSummary { id = u.id, usuario = u.usuario, email = u.email, ativo = u.ativo, rowVersion = u.RowVersion });
    }

    // POST /users (admin)
    //[Authorize(Roles = "admin")]
    [HttpPost]
    [ProducesResponseType(typeof(UserSummary), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] UsuarioCreateDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var usuarioNorm = dto.usuario.Trim();
        var emailNorm = dto.email.Trim().ToLowerInvariant();


        var exists = await _context.Usuarios.IgnoreQueryFilters() // considerar inativos também
        .AnyAsync(u => u.usuario == usuarioNorm || u.email.ToLower() == emailNorm, ct);
        if (exists) return Conflict(new ProblemDetails { Title = "Usuário ou e-mail já cadastrado." });


        var entidade = new Usuario
        {
            usuario = usuarioNorm,
            email = emailNorm,
            ativo = true,
            senha = BCrypt.Net.BCrypt.HashPassword(dto.senha)
        };


        _context.Usuarios.Add(entidade);
        await _context.SaveChangesAsync(ct);


        var body = new UserSummary { id = entidade.id, usuario = entidade.usuario, email = entidade.email, ativo = true, rowVersion = entidade.RowVersion };
        return CreatedAtAction(nameof(GetById), new { id = entidade.id, version = "1.0" }, body);
    }

    // PUT /users/{id} (admin) – requer RowVersion
    //[Authorize(Roles = "admin")]
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(UserSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, [FromBody] UsuarioUpdateDto dto, CancellationToken ct)
    {
        var u = await _context.Usuarios.FirstOrDefaultAsync(x => x.id == id, ct);
        if (u is null) return NotFound();
        if (!ModelState.IsValid) return ValidationProblem(ModelState);


        if (!dto.rowVersion.SequenceEqual(u.RowVersion))
            return Conflict(new ProblemDetails { Title = "Conflito de concorrência. Recarregue e tente novamente." });


        if (!string.IsNullOrWhiteSpace(dto.usuario)) u.usuario = dto.usuario.Trim();
        if (!string.IsNullOrWhiteSpace(dto.email)) u.email = dto.email.Trim().ToLowerInvariant();
        if (dto.ativo.HasValue) u.ativo = dto.ativo.Value;


        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new ProblemDetails { Title = "Conflito de concorrência ao salvar." });
        }


        var body = new UserSummary { id = u.id, usuario = u.usuario, email = u.email, ativo = u.ativo, rowVersion = u.RowVersion };
        return Ok(body);
    }

    // PATCH /users/{id}/password (mesmo ou admin)
    [HttpPatch("{id:int}/password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] PasswordChangeDto dto, CancellationToken ct)
    {
        var callerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var isAdmin = User.IsInRole("admin");
        if (callerId != id && !isAdmin) return Forbid();


        var u = await _context.Usuarios.FirstOrDefaultAsync(x => x.id == id && x.ativo, ct);
        if (u is null) return NotFound();


        if (!isAdmin) // usuário comum precisa da senha atual
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.senhaAtual, u.senha))
                return BadRequest(new ProblemDetails { Title = "Senha atual inválida." });
        }


        if (dto.novaSenha != dto.confirmacaoSenha)
            return BadRequest(new ProblemDetails { Title = "Nova senha e confirmação não coincidem." });


        if (dto.novaSenha.Length < 8)
            return BadRequest(new ProblemDetails { Title = "A senha deve ter pelo menos 8 caracteres." });


        if (!isAdmin && BCrypt.Net.BCrypt.Verify(dto.novaSenha, u.senha))
            return BadRequest(new ProblemDetails { Title = "Nova senha deve ser diferente da atual." });


        u.senha = BCrypt.Net.BCrypt.HashPassword(dto.novaSenha);
        await _context.SaveChangesAsync(ct);
        return NoContent();
    }

    // DELETE /users/{id} – soft delete
    //[Authorize(Roles = "admin")]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var u = await _context.Usuarios.FirstOrDefaultAsync(x => x.id == id, ct);
        if (u is null) return NotFound();
        u.ativo = false; // soft delete
        await _context.SaveChangesAsync(ct);
        return NoContent();
    }


    // POST /users/{id}/restore – reativa usuário soft-deletado
    //[Authorize(Roles = "admin")]
    [HttpPost("{id:int}/restore")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Restore(int id, CancellationToken ct)
    {
        var u = await _context.Usuarios.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.id == id, ct);
        if (u is null) return NotFound();
        u.ativo = true;
        await _context.SaveChangesAsync(ct);
        return NoContent();
    }
}