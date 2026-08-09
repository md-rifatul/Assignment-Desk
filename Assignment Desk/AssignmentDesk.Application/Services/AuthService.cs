using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        public AuthService(IUserRepository userRepository, IUnitOfWork unitOfWork, IEmailService emailService, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _configuration = configuration;
        }
        public async Task ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _userRepository.GetUserByEmail(dto.Email);

            if (user == null)
                return;

            var tokenBytes = RandomNumberGenerator.GetBytes(32);

            var token = Convert.ToBase64String(tokenBytes);

            var tokenHash = Convert.ToBase64String(
                SHA256.HashData(
                    Encoding.UTF8.GetBytes(token)
                )
            );


            user.PasswordResetTokenHash = tokenHash;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
            await _unitOfWork.CommitAsync();

            var clientBaseUrl = _configuration["AppSettings:ClientBaseUrl"];

            var resetLink = $"{clientBaseUrl}/reset-password?token={Uri.EscapeDataString(token)}";



            await _emailService.SendPasswordResetEmailAsync(user.Email,resetLink);

        }

        public async Task ResetPassword(ResetPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Token))
                throw new Exception("Reset token is required.");

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                throw new Exception("New password is required.");
            if (dto.NewPassword != dto.ConfirmPassword)
                throw new Exception("New password and comfirm password don't match");

            var tokenHash = Convert.ToBase64String(
                SHA256.HashData(
                    Encoding.UTF8.GetBytes(dto.Token)
                )
            );

            var user = await _userRepository
                .GetUserByResetTokenHashAsync(tokenHash);

            if (user == null)
                throw new Exception("Invalid reset token.");

            if (user.PasswordResetTokenExpiry == null ||
                user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                throw new Exception("Reset token has expired.");
            }

            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            user.PasswordResetTokenHash = null;
            user.PasswordResetTokenExpiry = null;

            await _unitOfWork.CommitAsync();
        }
    }
}
