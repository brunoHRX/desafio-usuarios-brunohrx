using System.Net;
using System.Net.Mail;

namespace desafio_usuarios_brunohrx.Services;

public static class EmailService
{
    public static async Task SendAsync(string to, string subject, string htmlBody)
    {
        var host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? throw new InvalidOperationException("SMTP_HOST ausente");
        var user = Environment.GetEnvironmentVariable("SMTP_USER") ?? throw new InvalidOperationException("SMTP_USER ausente");
        var pass = Environment.GetEnvironmentVariable("SMTP_PASS") ?? throw new InvalidOperationException("SMTP_PASS ausente");
        var port = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");

        var fromEmail = Environment.GetEnvironmentVariable("SENDER_EMAIL") ?? "no-reply@localhost.localdomain";
        var fromName = Environment.GetEnvironmentVariable("SENDER_NAME") ?? "Sistema";

        using var client = new SmtpClient(host, port)
        {
            
            EnableSsl = port == 465 || port == 587,
            Credentials = new NetworkCredential(user, pass),
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false
        };

        using var mail = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        
        var toTrimmed = (to ?? "").Trim();
        mail.To.Add(new MailAddress(toTrimmed));

        await client.SendMailAsync(mail);
    }
}
