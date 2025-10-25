namespace DesafioUsuarios.Api.Options;

public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";
    public string Host { get; init; } = default!;
    public int Port { get; init; }
    public string User { get; init; } = default!;
    public string Pass { get; init; } = default!;
    public string From { get; init; } = default!;
}
