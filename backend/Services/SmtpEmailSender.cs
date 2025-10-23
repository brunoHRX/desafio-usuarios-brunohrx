// Services/SmtpEmailSender.cs
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _user;
    private readonly string _pass;
    private readonly string _from;

    public SmtpEmailSender(IConfiguration cfg)
    {
        _host = cfg["SMTP_HOST"] ?? "live.smtp.mailtrap.io";
        _port = int.TryParse(cfg["SMTP_PORT"], out var p) ? p : 587;
        _user = cfg["SMTP_USER"] ?? "api";
        _pass = cfg["SMTP_PASS"] ?? "da6ffde4ceef38e55812ef0e310730cd";              // seu API token
        _from = cfg["SMTP_FROM"] ?? "no-reply@duckcode.dev";
    }

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        using var client = new SmtpClient(_host, _port)
        {
            Credentials = new NetworkCredential(_user, _pass),
            EnableSsl = true
        };

        using var msg = new MailMessage(_from, to, subject, htmlBody)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(msg);
    }
}
