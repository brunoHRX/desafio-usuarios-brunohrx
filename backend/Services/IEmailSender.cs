using System.Threading.Tasks;

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string htmlBody);
}
