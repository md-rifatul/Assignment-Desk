using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using AssignmentDesk.Infrastructure.Repositories.Auth;
using AssignmentDesk.Infrastructure.Repositories.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Assignment_Desk.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserRepository _repository;
    private readonly UnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserRepository repository, 
        UnitOfWork unitOfWork, 
        IJwtService jwtService, 
        IAuthService authService,
        IConfiguration configuration)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _authService = authService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto dto)
    {
        var user = await _repository.GetByEmailAsync(dto.Email);
        if (user == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return Unauthorized("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            return BadRequest("User account is inactive.");
        }

        var token = _jwtService.GenerateToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        var expiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(expiryDays);

        await _repository.UpdateAsync(user);

        return Ok(new LoginResponseDto
        {
            Token = token,
            RefreshToken = refreshToken
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] TokenRequestDto dto)
    {
        if (dto == null || string.IsNullOrEmpty(dto.Token) || string.IsNullOrEmpty(dto.RefreshToken))
        {
            return BadRequest("Invalid client request");
        }

        try
        {
            var principal = _jwtService.GetPrincipalFromExpiredToken(dto.Token);
            var emailClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.Email) ?? principal.FindFirst("email");
            if (emailClaim == null)
            {
                return BadRequest("Invalid token: Email claim is missing");
            }

            var user = await _repository.GetByEmailAsync(emailClaim.Value);
            if (user == null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiry <= DateTime.UtcNow)
            {
                return BadRequest("Invalid client request");
            }

            var newAccessToken = _jwtService.GenerateToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            var expiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(expiryDays);

            await _repository.UpdateAsync(user);

            return Ok(new LoginResponseDto
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Token refresh failed: {ex.Message}");
        }
    }


    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _authService.ForgotPassword(dto);
        return Ok("If the email exists, a password reset link has been sent.");
    }


    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        await _authService.ResetPassword(dto);

        return Ok("Password reset successfully.");
    }


    [HttpPost("activate-account")]
    [AllowAnonymous]
    public async Task<IActionResult> ActivateAccount(
    [FromBody] ActivateAccountDto dto)
    {
        await _authService.ActivateAccount(dto);

        return Ok("Account activated successfully.");
    }
}

public class TokenRequestDto
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
}