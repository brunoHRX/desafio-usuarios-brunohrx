using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace desafio_usuarios_brunohrx.Data;


public class AuthRefreshToken
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();


    [Required]
    public int UserId { get; set; }


    [ForeignKey(nameof(UserId))]
    public Usuario User { get; set; } = default!;


    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RevokedAt { get; set; }


    [StringLength(64)]
    public string? Ip { get; set; }


    [StringLength(256)]
    public string? UserAgent { get; set; }


    public bool IsActive => RevokedAt == null && ExpiresAt > DateTimeOffset.UtcNow;
}