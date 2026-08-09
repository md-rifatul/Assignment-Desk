using AssignmentDesk.Application.Interfaces.IServices;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace AssignmentDesk.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }
        public async Task SendPasswordResetEmailAsync(string email, string resetLink)
        {
            var message = new MimeMessage();

            message.From.Add(
                new MailboxAddress(
                    "AssignmentDesk",
                    _settings.Email));

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

            using var smtp = new SmtpClient();

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
    }
}
