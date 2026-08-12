using AssignmentDesk.Application.Interfaces.IServices;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

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
            _ = Task.Run(async () =>
            {
                try
                {
                    using var client = new HttpClient();
                    client.DefaultRequestHeaders.Authorization = 
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _settings.ApiKey);

                    var fromEmail = string.IsNullOrEmpty(_settings.Email) ? "onboarding@resend.dev" : _settings.Email;

                    var requestBody = new
                    {
                        from = $"AssignmentDesk <{fromEmail}>",
                        to = new[] { email },
                        subject = "Welcome to AssignmentDesk - Activate Your Account",
                        html = $"""
                            <html>
                            <body style="font-family: Arial, sans-serif;">
                                <h2>Welcome to AssignmentDesk</h2>
                                <p>Hello {fullName},</p>
                                <p>Your AssignmentDesk account has been created by an administrator.</p>
                                <p>Please activate your account and create your password by clicking the button below.</p>
                                <p>
                                    <a href="{activationLink}" style="display:inline-block; padding:12px 20px; background-color:#007bff; color:white; text-decoration:none; border-radius:5px;">
                                        Activate Your Account
                                    </a>
                                </p>
                                <p>This activation link will expire in <strong>7 days</strong>.</p>
                                <p>If you did not expect this account, please ignore this email.</p>
                                <p>Regards,<br/>AssignmentDesk Team</p>
                            </body>
                            </html>
                            """
                    };

                    var json = JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync("https://api.resend.com/emails", content);
                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        throw new Exception($"Resend API error (HTTP {response.StatusCode}): {errorContent}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("==================================================");
                    Console.WriteLine($"[EMAIL ERROR] Failed to send activation email to {email}");
                    Console.WriteLine($"Activation Link: {activationLink}");
                    Console.WriteLine($"Error: {ex.Message}");
                    Console.WriteLine("==================================================");
                }
            });
            await Task.CompletedTask;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetLink)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    using var client = new HttpClient();
                    client.DefaultRequestHeaders.Authorization = 
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _settings.ApiKey);

                    var fromEmail = string.IsNullOrEmpty(_settings.Email) ? "onboarding@resend.dev" : _settings.Email;

                    var requestBody = new
                    {
                        from = $"AssignmentDesk <{fromEmail}>",
                        to = new[] { email },
                        subject = "AssignmentDesk - Reset Password",
                        html = $"""
                            <html>
                            <body style="font-family: Arial, sans-serif;">
                                <h2>AssignmentDesk</h2>
                                <p>Hello,</p>
                                <p>We received a request to reset your AssignmentDesk password.</p>
                                <p>Click the button below to reset your password:</p>
                                <p>
                                    <a href="{resetLink}" style="display:inline-block; padding:12px 20px; background-color:#007bff; color:white; text-decoration:none; border-radius:5px;">
                                        Reset Password
                                    </a>
                                </p>
                                <p>This link will expire in <strong>15 minutes</strong>.</p>
                                <p>If you did not request a password reset, you can safely ignore this email.</p>
                                <p>Regards,<br/>AssignmentDesk Team</p>
                            </body>
                            </html>
                            """
                    };

                    var json = JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync("https://api.resend.com/emails", content);
                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        throw new Exception($"Resend API error (HTTP {response.StatusCode}): {errorContent}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("==================================================");
                    Console.WriteLine($"[EMAIL ERROR] Failed to send password reset email to {email}");
                    Console.WriteLine($"Reset Link: {resetLink}");
                    Console.WriteLine($"Error: {ex.Message}");
                    Console.WriteLine("==================================================");
                }
            });
            await Task.CompletedTask;
        }
    }
}
