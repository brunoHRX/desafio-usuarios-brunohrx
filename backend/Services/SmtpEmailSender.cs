using DesafioUsuarios.Api.Options;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly SmtpOptions _opts;

    public SmtpEmailSender(IOptions<SmtpOptions> opts)
    {
        _opts = opts.Value;
    }

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        using var client = new SmtpClient(_opts.Host, _opts.Port)
        {
            Credentials = new NetworkCredential(_opts.User, _opts.Pass),
            EnableSsl = true
        };

        using var msg = new MailMessage(_opts.From, to, subject, htmlBody)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(msg);
    }
}
