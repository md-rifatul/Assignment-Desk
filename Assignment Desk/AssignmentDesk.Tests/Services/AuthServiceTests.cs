using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Application.Services;
using AssignmentDesk.Domain.Entities;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using System.Security.Cryptography;
using System.Text;

namespace AssignmentDesk.Tests.Services;

[TestFixture]
public class AuthServiceTests
{
    private Mock<IUserRepository> _userRepositoryMock = null!;
    private Mock<IUnitOfWork> _unitOfWorkMock = null!;
    private Mock<IEmailService> _emailServiceMock = null!;
    private Mock<IConfiguration> _configurationMock = null!;

    private AuthService _authService = null!;

    [SetUp]
    public void Setup()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _emailServiceMock = new Mock<IEmailService>();
        _configurationMock = new Mock<IConfiguration>();

        _configurationMock
            .Setup(x => x["AppSettings:ClientBaseUrl"])
            .Returns("http://localhost:3000");

        _authService = new AuthService(
            _userRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _emailServiceMock.Object,
            _configurationMock.Object
        );
    }

    [Test]
    public async Task ActivateAccount_ShouldThrowException_WhenTokenIsEmpty()
    {
        var dto = new ActivateAccountDto
        {
            Token = "",
            Password = "Password123",
            ConfirmPassword = "Password123"
        };

        Func<Task> action = async () =>
            await _authService.ActivateAccount(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Activation token is required.");

        _userRepositoryMock.Verify(
            x => x.GetUserByActivationTokenHashAsync(
                It.IsAny<string>()),
            Times.Never);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);
    }

    [Test]
    public async Task ActivateAccount_ShouldThrowException_WhenPasswordIsEmpty()
    {
        var dto = new ActivateAccountDto
        {
            Token = "valid-token",
            Password = "",
            ConfirmPassword = ""
        };

        Func<Task> action = async () =>
            await _authService.ActivateAccount(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Password is required.");

        _userRepositoryMock.Verify(
            x => x.GetUserByActivationTokenHashAsync(
                It.IsAny<string>()),
            Times.Never);
    }

    [Test]
    public async Task ActivateAccount_ShouldThrowException_WhenPasswordsDoNotMatch()
    {
        var dto = new ActivateAccountDto
        {
            Token = "valid-token",
            Password = "Password123",
            ConfirmPassword = "Password456"
        };

        Func<Task> action = async () =>
            await _authService.ActivateAccount(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Passwords do not match.");

        _userRepositoryMock.Verify(
            x => x.GetUserByActivationTokenHashAsync(
                It.IsAny<string>()),
            Times.Never);
    }

    [Test]
    public async Task ActivateAccount_ShouldThrowException_WhenTokenIsInvalid()
    {
        var token = "invalid-token";

        var dto = new ActivateAccountDto
        {
            Token = token,
            Password = "Password123",
            ConfirmPassword = "Password123"
        };

        _userRepositoryMock
            .Setup(x =>
                x.GetUserByActivationTokenHashAsync(
                    It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        Func<Task> action = async () =>
            await _authService.ActivateAccount(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Invalid activation token.");

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);
    }

    [Test]
    public async Task ActivateAccount_ShouldThrowException_WhenTokenIsExpired()
    {
        var token = "expired-token";

        var tokenHash = Convert.ToBase64String(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)));

        var user = new User
        {
            Id = 1,
            Email = "user@gmail.com",
            IsActive = false,
            ActivationTokenHash = tokenHash,
            ActivationTokenExpiry = DateTime.UtcNow.AddMinutes(-10),
            PasswordHash = "old-password"
        };

        var dto = new ActivateAccountDto
        {
            Token = token,
            Password = "Password123",
            ConfirmPassword = "Password123"
        };

        _userRepositoryMock
            .Setup(x =>
                x.GetUserByActivationTokenHashAsync(tokenHash))
            .ReturnsAsync(user);

        Func<Task> action = async () =>
            await _authService.ActivateAccount(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Activation token has expired.");

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);
    }

    [Test]
    public async Task ActivateAccount_ShouldActivateUser_WhenTokenIsValid()
    {
        var token = "valid-activation-token";

        var tokenHash = Convert.ToBase64String(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)));

        var user = new User
        {
            Id = 1,
            Email = "user@gmail.com",
            IsActive = false,
            ActivationTokenHash = tokenHash,
            ActivationTokenExpiry = DateTime.UtcNow.AddHours(1),
            PasswordHash = "old-password"
        };

        var dto = new ActivateAccountDto
        {
            Token = token,
            Password = "Password123",
            ConfirmPassword = "Password123"
        };

        _userRepositoryMock
            .Setup(x =>
                x.GetUserByActivationTokenHashAsync(tokenHash))
            .ReturnsAsync(user);

        await _authService.ActivateAccount(dto);

        user.IsActive
            .Should()
            .BeTrue();

        user.PasswordHash
            .Should()
            .NotBe("old-password");

        BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash)
            .Should()
            .BeTrue();

        user.ActivationTokenHash
            .Should()
            .BeNull();

        user.ActivationTokenExpiry
            .Should()
            .BeNull();

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Once);
    }

    [Test]
    public async Task ForgotPassword_ShouldReturn_WhenUserDoesNotExist()
    {
        var dto = new ForgotPasswordDto
        {
            Email = "notfound@gmail.com"
        };

        _userRepositoryMock
            .Setup(x => x.GetUserByEmail(dto.Email))
            .ReturnsAsync((User?)null);

        await _authService.ForgotPassword(dto);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);

        _emailServiceMock.Verify(
            x => x.SendPasswordResetEmailAsync(
                It.IsAny<string>(),
                It.IsAny<string>()),
            Times.Never);
    }

    [Test]
    public async Task ForgotPassword_ShouldGenerateResetTokenAndSendEmail()
    {
        var dto = new ForgotPasswordDto
        {
            Email = "user@gmail.com"
        };

        var user = new User
        {
            Id = 1,
            Email = dto.Email,
            FullName = "Test User"
        };

        _userRepositoryMock
            .Setup(x => x.GetUserByEmail(dto.Email))
            .ReturnsAsync(user);

        await _authService.ForgotPassword(dto);

        user.PasswordResetTokenHash
            .Should()
            .NotBeNullOrWhiteSpace();

        user.PasswordResetTokenExpiry
            .Should()
            .NotBeNull();

        user.PasswordResetTokenExpiry
            .Value
            .Should()
            .BeAfter(DateTime.UtcNow);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Once);

        _emailServiceMock.Verify(
            x => x.SendPasswordResetEmailAsync(
                user.Email,
                It.Is<string>(link =>
                    link.StartsWith(
                        "http://localhost:3000/reset-password?token="))),
            Times.Once);
    }

    [Test]
    public async Task ResetPassword_ShouldThrowException_WhenTokenIsEmpty()
    {
        var dto = new ResetPasswordDto
        {
            Token = "",
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        Func<Task> action = async () =>
            await _authService.ResetPassword(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Reset token is required.");

        _userRepositoryMock.Verify(
            x => x.GetUserByResetTokenHashAsync(
                It.IsAny<string>()),
            Times.Never);
    }

    [Test]
    public async Task ResetPassword_ShouldThrowException_WhenNewPasswordIsEmpty()
    {
        var dto = new ResetPasswordDto
        {
            Token = "valid-token",
            NewPassword = "",
            ConfirmPassword = ""
        };

        Func<Task> action = async () =>
            await _authService.ResetPassword(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("New password is required.");

        _userRepositoryMock.Verify(
            x => x.GetUserByResetTokenHashAsync(
                It.IsAny<string>()),
            Times.Never);
    }

    [Test]
    public async Task ResetPassword_ShouldThrowException_WhenPasswordsDoNotMatch()
    {
        var dto = new ResetPasswordDto
        {
            Token = "valid-token",
            NewPassword = "NewPassword123",
            ConfirmPassword = "DifferentPassword123"
        };

        Func<Task> action = async () =>
            await _authService.ResetPassword(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage(
                "New password and comfirm password don't match");

        _userRepositoryMock.Verify(
            x => x.GetUserByResetTokenHashAsync(
                It.IsAny<string>()),
            Times.Never);
    }

    [Test]
    public async Task ResetPassword_ShouldThrowException_WhenTokenIsInvalid()
    {
        var dto = new ResetPasswordDto
        {
            Token = "invalid-token",
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        _userRepositoryMock
            .Setup(x =>
                x.GetUserByResetTokenHashAsync(
                    It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        Func<Task> action = async () =>
            await _authService.ResetPassword(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Invalid reset token.");

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);
    }

    [Test]
    public async Task ResetPassword_ShouldThrowException_WhenTokenIsExpired()
    {
        var token = "expired-reset-token";

        var tokenHash = Convert.ToBase64String(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)));

        var user = new User
        {
            Id = 1,
            Email = "user@gmail.com",
            PasswordHash = "old-password",
            PasswordResetTokenHash = tokenHash,
            PasswordResetTokenExpiry =
                DateTime.UtcNow.AddMinutes(-5)
        };

        var dto = new ResetPasswordDto
        {
            Token = token,
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        _userRepositoryMock
            .Setup(x =>
                x.GetUserByResetTokenHashAsync(tokenHash))
            .ReturnsAsync(user);

        Func<Task> action = async () =>
            await _authService.ResetPassword(dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Reset token has expired.");

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);
    }

    [Test]
    public async Task ResetPassword_ShouldResetPassword_WhenTokenIsValid()
    {
        var token = "valid-reset-token";

        var tokenHash = Convert.ToBase64String(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)));

        var user = new User
        {
            Id = 1,
            Email = "user@gmail.com",
            PasswordHash = "old-password",
            PasswordResetTokenHash = tokenHash,
            PasswordResetTokenExpiry =
                DateTime.UtcNow.AddMinutes(10)
        };

        var dto = new ResetPasswordDto
        {
            Token = token,
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        _userRepositoryMock
            .Setup(x =>
                x.GetUserByResetTokenHashAsync(tokenHash))
            .ReturnsAsync(user);

        await _authService.ResetPassword(dto);

        user.PasswordHash
            .Should()
            .NotBe("old-password");

        BCrypt.Net.BCrypt.Verify(
            dto.NewPassword,
            user.PasswordHash)
            .Should()
            .BeTrue();

        user.PasswordResetTokenHash
            .Should()
            .BeNull();

        user.PasswordResetTokenExpiry
            .Should()
            .BeNull();

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Once);
    }
}