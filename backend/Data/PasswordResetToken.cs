namespace desafio_usuarios_brunohrx.Data
{
    public class PasswordResetToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int UserId { get; set; }
        public Usuario User { get; set; } = null!;

        public DateTimeOffset ExpiresAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public bool Used { get; set; } = false;

        public string? Ip { get; set; }
        public string? UserAgent { get; set; }

        public bool IsValid => !Used && DateTimeOffset.UtcNow < ExpiresAt;
    }
}
