using AssignmentDesk.Application.Interfaces.IServices;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Text;
using System.Threading.Tasks;
using MailKit.Net.Smtp;

namespace AssignmentDesk.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendAccountActivationEmailAsync(
            string email,
            string fullName,
            string activationLink)
        {
            var message = new MimeMessage();

            var senderEmail = string.IsNullOrEmpty(_settings.SenderEmail) ? _settings.Email : _settings.SenderEmail;
            message.From.Add(
                new MailboxAddress(
                    "AssignmentDesk",
                    senderEmail));

            message.To.Add(
                MailboxAddress.Parse(email));

            message.Subject =
                "Welcome to AssignmentDesk - Activate Your Account";

            var body = $"""
        <html>
        <body style="font-family: Arial, sans-serif;">

            <h2>Welcome to AssignmentDesk</h2>

            <p>Hello {fullName},</p>

            <p>
                Your AssignmentDesk account has been created
                by an administrator.
            </p>

            <p>
                Please activate your account and create your
                password by clicking the button below.
            </p>

            <p>
                <a href="{activationLink}"
                   style="
                       display:inline-block;
                       padding:12px 20px;
                       background-color:#007bff;
                       color:white;
                       text-decoration:none;
                       border-radius:5px;
                   ">
                    Activate Your Account
                </a>
            </p>

            <p>
                This activation link will expire in
                <strong>7 days</strong>.
            </p>

            <p>
                If you did not expect this account,
                please ignore this email.
            </p>

            <p>
                Regards,<br/>
                AssignmentDesk Team
            </p>

        </body>
        </html>
        """;

            message.Body = new BodyBuilder
            {
                HtmlBody = body
            }.ToMessageBody();

            _ = Task.Run(async () =>
            {
                try
                {
                    using var smtp = new SmtpClient();

                    // Connect using STARTTLS (port 2525 supports STARTTLS)
                    await smtp.ConnectAsync(
                        _settings.SmtpServer,
                        _settings.Port,
                        SecureSocketOptions.StartTls);

                    await smtp.AuthenticateAsync(
                        _settings.Email,
                        _settings.Password);

                    await smtp.SendAsync(message);
                    await smtp.DisconnectAsync(true);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("==================================================");
                    Console.WriteLine($"[SMTP ERROR] Failed to send activation email to {email}");
                    Console.WriteLine($"Activation Link: {activationLink}");
                    Console.WriteLine($"Error: {ex.Message}");
                    Console.WriteLine("==================================================");
                }
            });
            await Task.CompletedTask;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetLink)
        {
            var message = new MimeMessage();

            var senderEmail = string.IsNullOrEmpty(_settings.SenderEmail) ? _settings.Email : _settings.SenderEmail;
            message.From.Add(
                new MailboxAddress(
                    "AssignmentDesk",
                    senderEmail));

            message.To.Add(
                MailboxAddress.Parse(email));

            message.Subject =
                "AssignmentDesk - Reset Password";

            var body = $@"
                                    <html>
                <body style='font-family: Arial, sans-serif;'>

                    <h2>AssignmentDesk</h2>

                    <p>Hello,</p>

                    <p>
                        We received a request to reset your
                        AssignmentDesk password.
                    </p>

                    <p>
                        Click the button below to reset your password:
                    </p>

                    <p>
                        <a href='{resetLink}'
                           style='
                               display:inline-block;
                               padding:12px 20px;
                               background-color:#007bff;
                               color:white;
                               text-decoration:none;
                               border-radius:5px;
                           '>
                            Reset Password
                        </a>
                    </p>

                    <p>
                        This link will expire in
                        <strong>15 minutes</strong>.
                    </p>

                    <p>
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <br/>

                    <p>
                        Regards,<br/>
                        AssignmentDesk Team
                    </p>

                </body>
                </html>
                ";

            message.Body = new BodyBuilder
            {
                HtmlBody = body
            }.ToMessageBody();

            _ = Task.Run(async () =>
            {
                try
                {
                    using var smtp = new SmtpClient();

                    // Connect using STARTTLS (port 2525 supports STARTTLS)
                    await smtp.ConnectAsync(
                        _settings.SmtpServer,
                        _settings.Port,
                        SecureSocketOptions.StartTls);

                    await smtp.AuthenticateAsync(
                         _settings.Email,
                           _settings.Password);

                    await smtp.SendAsync(message);
                    await smtp.DisconnectAsync(true);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("==================================================");
                    Console.WriteLine($"[SMTP ERROR] Failed to send password reset email to {email}");
                    Console.WriteLine($"Reset Link: {resetLink}");
                    Console.WriteLine($"Error: {ex.Message}");
                    Console.WriteLine("==================================================");
                }
            });
            await Task.CompletedTask;
        }
    }
}
