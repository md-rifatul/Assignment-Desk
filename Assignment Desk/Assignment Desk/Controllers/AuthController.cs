using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using AssignmentDesk.Infrastructure.Repositories.Auth;
using AssignmentDesk.Infrastructure.Repositories.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Desk.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserRepository _repository;
    private readonly UnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly IAuthService _authService;

    public AuthController(UserRepository repository, UnitOfWork unitOfWork, IJwtService jwtService, IAuthService authService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _authService = authService;
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

        return Ok(new LoginResponseDto
        {
            Token = token
        });
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