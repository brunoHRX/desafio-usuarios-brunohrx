using desafio_usuarios_brunohrx.Data;
using desafio_usuarios_brunohrx.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace desafio_usuarios_brunohrx.Controllers;


[AllowAnonymous]
[ApiController]
[ApiVersion("1")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase {

    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // POST: /auth/login
    [HttpPost("login")]
    [EnableRateLimiting("auth-strict")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var user = await _context.Usuarios.AsNoTracking()
        .FirstOrDefaultAsync(u => u.usuario == request.usuario && u.ativo, ct);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.senha, user.senha))
            return Unauthorized(new ProblemDetails { Title = "Usuário ou senha inválidos." });


        var (jwt, expiresIn) = CreateAccessToken(user);
        var refresh = await CreateRefreshToken(user.id, HttpContext, ct);


        var body = new AuthResponse(jwt, expiresIn, refresh.ToString(),
        new UserSummary { id = user.id, usuario = user.usuario, email = user.email, ativo = user.ativo });
        return Ok(body);
    }

    // POST: /auth/signup
    [HttpPost("signup")]
    [ProducesResponseType(typeof(UserSummary), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Signup([FromBody] SignupRequest req, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(req.usuario) || req.usuario.Trim().Length < 2)
            errors["usuario"] = new[] { "Usuário deve ter ao menos 2 caracteres." };

        if (string.IsNullOrWhiteSpace(req.email) || !req.email.Contains('@'))
            errors["email"] = new[] { "E-mail inválido." };

        if (string.IsNullOrWhiteSpace(req.senha) || req.senha.Length < 8)
            errors["senha"] = new[] { "Senha deve ter pelo menos 8 caracteres." };

        if (errors.Count > 0)
            return ValidationProblem(new ValidationProblemDetails(errors));

        var usuarioNorm = req.usuario.Trim();
        var emailNorm = req.email.Trim().ToLowerInvariant();

        // === Verificação de duplicidade ===
        var exists = await _context.Usuarios.IgnoreQueryFilters()
            .AnyAsync(u => u.usuario == usuarioNorm || u.email.ToLower() == emailNorm, ct);

        if (exists)
            return Conflict(new ProblemDetails { Title = "Usuário ou e-mail já cadastrado." });

        var entidade = new Usuario
        {
            usuario = usuarioNorm,
            email = emailNorm,
            ativo = true, // ou false se quiser exigir confirmação de e-mail
            senha = BCrypt.Net.BCrypt.HashPassword(req.senha)
        };

        _context.Usuarios.Add(entidade);
        await _context.SaveChangesAsync(ct);

        var body = new UserSummary
        {
            id = entidade.id,
            usuario = entidade.usuario,
            email = entidade.email,
            ativo = entidade.ativo,
            rowVersion = entidade.RowVersion
        };

        return CreatedAtAction(nameof(Me), new { version = "1" }, body);
    }

    // POST: /auth/refresh
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] string refreshToken, CancellationToken ct)
    {
        if (!Guid.TryParse(refreshToken, out var tokenId))
            return Unauthorized(new ProblemDetails { Title = "Refresh token inválido." });


        var token = await _context.AuthRefreshTokens
        .Include(t => t.User)
        .FirstOrDefaultAsync(t => t.Id == tokenId, ct);


        if (token is null || !token.IsActive)
            return Unauthorized(new ProblemDetails { Title = "Refresh token expirado ou revogado." });


        // Revoga o atual e emite outro token de persistência
        token.RevokedAt = DateTimeOffset.UtcNow;
        var newRefreshId = await CreateRefreshToken(token.UserId, HttpContext, ct);


        var (jwt, expiresIn) = CreateAccessToken(token.User);


        await _context.SaveChangesAsync(ct);


        var body = new AuthResponse(jwt, expiresIn, newRefreshId.ToString(),
        new UserSummary { id = token.User.id, usuario = token.User.usuario, email = token.User.email, ativo = token.User.ativo });
        return Ok(body);
    }

    // POST: /auth/logout
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout([FromBody] string refreshToken, CancellationToken ct)
    {
        if (!Guid.TryParse(refreshToken, out var tokenId)) return NoContent();
        var token = await _context.AuthRefreshTokens.FirstOrDefaultAsync(t => t.Id == tokenId, ct);
        if (token != null && token.RevokedAt == null)
        {
            token.RevokedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(ct);
        }
        return NoContent();
    }

    // GET: /auth/me
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserSummary), StatusCodes.Status200OK)]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var user = await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.id == userId, ct);
        if (user is null) return NotFound();
        return Ok(new UserSummary { id = user.id, usuario = user.usuario, email = user.email, ativo = user.ativo });
    }


    private (string jwt, int expiresIn) CreateAccessToken(Usuario user)
    {
        var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key ausente");
        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];


        var claims = new List<Claim>
        {
        new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
        new Claim(ClaimTypes.Name, user.usuario)
        };


        var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(60); // 60 min


        var token = new JwtSecurityToken(issuer, audience, claims, expires: expires, signingCredentials: creds);
        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        var expiresIn = (int)TimeSpan.FromMinutes(60).TotalSeconds;
        return (jwt, expiresIn);
    }

    // POST: /auth/forgot
    [HttpPost("forgot")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req, CancellationToken ct)
    {
        
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var email = (req.Email ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            var problem = new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["Email"] = new[] { "E-mail inválido." }
            })
            {
                Title = "Erros de validação",
                Status = StatusCodes.Status400BadRequest
            };
            return ValidationProblem(problem);
        }

        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.email == email && u.ativo, ct);

        
        if (user is null) return NoContent();

        // Cria token de reset (expira em 1 hora)
        var token = new PasswordResetToken
        {
            UserId = user.id,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
            Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = HttpContext.Request.Headers.UserAgent.ToString()
        };

        _context.PasswordResetTokens.Add(token);
        await _context.SaveChangesAsync(ct);

        // Gera link para o FRONTEND
        var baseUrl = Environment.GetEnvironmentVariable("FRONT_BASE_URL") ?? "http://localhost:9000";
        var resetLink = $"{baseUrl}/reset-password?token={token.Id}";

        // Corpo do e-mail (simples, pode trocar por template)
        var html = $@"
          <p>Olá {user.usuario},</p>
          <p>Recebemos uma solicitação para redefinir sua senha. Se foi você, use o link abaixo (expira em 1 hora):</p>
          <p>
            <a href=""{resetLink}"" style=""display:inline-block;background:#2563eb;color:#fff;
               padding:10px 16px;border-radius:8px;text-decoration:none"">
               Redefinir senha
            </a>
          </p>
          <p>Se o botão não funcionar, copie e cole este link no navegador:<br/>{resetLink}</p>
          <p>Se você não solicitou, pode ignorar este e-mail.</p>";

        await EmailService.SendAsync(user.email, "Redefinição de senha", html);

        return NoContent();
    }


    // POST: /auth/reset
    [HttpPost("reset")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req, CancellationToken ct)
    {
        
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (req.NovaSenha != req.ConfirmacaoSenha)
        {
            var problem = new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["ConfirmacaoSenha"] = new[] { "Confirmação de senha não confere." }
            })
            {
                Title = "Erros de validação",
                Status = StatusCodes.Status400BadRequest
            };
            return ValidationProblem(problem);
        }

        var token = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == req.Token, ct);

        if (token is null || !token.IsValid)
            return BadRequest(new ProblemDetails { Title = "Token inválido, expirado ou já utilizado." });

        // Redefine a senha
        token.User.senha = BCrypt.Net.BCrypt.HashPassword(req.NovaSenha);
        token.Used = true;

        
        var refreshToRevoke = _context.AuthRefreshTokens
            .Where(r => r.UserId == token.UserId && r.RevokedAt == null);
        await refreshToRevoke.ForEachAsync(r => r.RevokedAt = DateTimeOffset.UtcNow, ct);

        await _context.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("test-email")]
    public async Task<IActionResult> TestEmail()
    {
        await EmailService.SendAsync("seuemail@teste.com", "Teste SMTP", "<p>Funcionando 🎉</p>");
        return Ok("E-mail enviado com sucesso");
    }


    private async Task<Guid> CreateRefreshToken(int userId, HttpContext context, CancellationToken ct)
    {
        var rt = new AuthRefreshToken
        {
            UserId = userId,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            Ip = context.Connection.RemoteIpAddress?.ToString(),
            UserAgent = context.Request.Headers.UserAgent.ToString()
        };
        _context.AuthRefreshTokens.Add(rt);
        await _context.SaveChangesAsync(ct);
        return rt.Id;
    }
}
