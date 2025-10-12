using System.ComponentModel.DataAnnotations;


namespace desafio_usuarios_brunohrx.Controllers;


public class UsuarioCreateDto
{
    [Required, StringLength(60, MinimumLength = 3)]
    public string usuario { get; set; } = default!;


    [Required, EmailAddress, StringLength(160)]
    public string email { get; set; } = default!;


    [Required, StringLength(128, MinimumLength = 8)]
    public string senha { get; set; } = default!;
}


public class UsuarioUpdateDto
{
    [StringLength(60, MinimumLength = 3)]
    public string? usuario { get; set; }


    [EmailAddress, StringLength(160)]
    public string? email { get; set; }


    public bool? ativo { get; set; }


    [Required]
    public byte[] rowVersion { get; set; } = Array.Empty<byte>();
}


public class AlterarSenhaPayload
{
    [Required] public string senha { get; set; } = default!;
    [Required] public string nova_senha { get; set; } = default!;
    [Required] public string confirmacao_senha { get; set; } = default!;
}


public class PasswordChangeDto
{
    [Required] public string senhaAtual { get; set; } = default!;
    [Required] public string novaSenha { get; set; } = default!;
    [Required] public string confirmacaoSenha { get; set; } = default!;
}


public record UserSummary
{
    public int id { get; init; }
    public string usuario { get; init; } = string.Empty;
    public string email { get; init; } = string.Empty;
    public bool ativo { get; init; }
    public byte[]? rowVersion { get; init; }
}


public record PagedResult<T>(IEnumerable<T> items, int total, int page, int pageSize);


// Auth
public class LoginRequest
{
    [Required] public string usuario { get; set; } = default!;
    [Required] public string senha { get; set; } = default!;
}

public class SignupRequest
{
    [Required, MinLength(2)]
    public string usuario { get; set; } = null!;
    [Required, EmailAddress]
    public string email { get; set; } = null!;
    [Required, MinLength(8)]
    public string senha { get; set; } = null!;
}


public record AuthResponse(string accessToken, int expiresIn, string refreshToken, UserSummary user);