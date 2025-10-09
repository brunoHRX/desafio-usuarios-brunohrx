using desafio_usuarios_brunohrx.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace desafio_usuarios_brunohrx.Controllers;

[Authorize]
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public UsuariosController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // GET: api/v1/Usuarios
    [HttpGet]
    public async Task<IActionResult> GetUsuarios()
    {
        var usuarios = await _context.Usuarios.ToListAsync();
        return Ok(usuarios);
    }

    // GET: api/v1/Usuarios/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound();
        }
        return Ok(new
            {
                usuario.id,
                usuario.usuario,
                usuario.email,
            }
        );
    }


    // POST: api/v1/Usuarios
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] UsuarioCreateDto dto)
    {
        if (!ModelState.IsValid) // Check se o modelo é válido
        {
            return BadRequest(ModelState);
        }

        var objeto = new Usuario
        {
            usuario = dto.usuario,
            email = dto.email,
            ativo = true,
            senha = BCrypt.Net.BCrypt.HashPassword(dto.senha),
        };

        _context.Usuarios.Add(objeto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUsuario), new { id = objeto.id }, new { objeto.id, objeto.usuario, objeto.email, objeto.ativo }); // Objeto Dto sem senha

    }

    // PUT: api/v1/Usuarios/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUsuario(int id, [FromBody] UsuarioUpdateDto dto)
    {
        var objeto = await _context.Usuarios.FindAsync(id);
        if (objeto == null)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Atualiza campos permitidos
        if (dto.usuario != null)
            objeto.usuario = dto.usuario;

        if (dto.email != null)
            objeto.email = dto.email;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Usuarios.Any(c => c.id == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // POST: api/v1/Usuarios/alterar_senha
    [HttpPost("alterar_senha")]
    public async Task<IActionResult> UpdatePassword([FromBody] AlterarSenhaPayload payload)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.id == userId && u.ativo);

        if (usuario == null)
        {
            return NotFound("Usuário não encontrado ou inativo.");
        }

        if (!BCrypt.Net.BCrypt.Verify(payload.senha, usuario.senha))
        {
            return BadRequest("Senha inválida.");
        }

        if (payload.nova_senha != payload.confirmacao_senha)
        {
            return BadRequest("A nova senha e a confirmação não coincidem.");
        }

        if (payload.nova_senha == payload.senha)
        {
            return BadRequest("A nova senha deve ser diferente da atual.");
        }

        usuario.senha = BCrypt.Net.BCrypt.HashPassword(payload.nova_senha);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/v1/Usuarios/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound();
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST: api/v1/Usuarios/login
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        // Busca o usuário no banco de dados pelo nome de usuário e se ele esta ativo
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.usuario == request.usuario && u.ativo);

        if (usuario == null)
        {
            return Unauthorized("Usuário não encontrado ou inativo.");
        }

        // Verifica se a senha fornecida corresponde à senha armazenada
        if (!BCrypt.Net.BCrypt.Verify(request.senha, usuario.senha))
        {
            return Unauthorized("Senha inválida.");
        }

        // Gera o token JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = _configuration["Jwt:Key"]!;

        if (string.IsNullOrEmpty(key))
        {
            return StatusCode(500, "A chave JWT não está configurada.");
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
            new Claim(ClaimTypes.Name, usuario.usuario),
            new Claim(ClaimTypes.NameIdentifier, usuario.id.ToString())
        }),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        // Retorna o token, o usuário (sem senha)
        return Ok(new
        {
            Token = tokenHandler.WriteToken(token),
            Usuario = new
            {
                usuario.id,
                usuario.usuario,
                usuario.email,
            }
        });
    }
}


public class UsuarioCreateDto
{
    public required string usuario { get; set; }
    public required string senha { get; set; }
    public required string email { get; set; }
}

public class UsuarioUpdateDto
{
    public string? usuario { get; set; }
    public string? email { get; set; }
}

public class AlterarSenhaPayload
{
    public required string senha { get; set; }
    public required string nova_senha { get; set; }
    public required string confirmacao_senha { get; set; }
}

public class LoginDto
{
    public required string usuario { get; set; }
    public required string senha { get; set; }
}