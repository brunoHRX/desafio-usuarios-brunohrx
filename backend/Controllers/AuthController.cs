using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using desafio_usuarios_brunohrx.Data;

namespace desafio_usuarios_brunohrx.Controllers;


[AllowAnonymous]
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase {

    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // POST: /auth/tokens
    [HttpPost("tokens")]
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
