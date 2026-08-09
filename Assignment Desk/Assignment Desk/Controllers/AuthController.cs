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

    public AuthController(UserRepository repository, UnitOfWork unitOfWork, IJwtService jwtService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    [Authorize(Roles ="Admin")]
    public async Task<IActionResult> Register(AdminRegisterDto dto)
    {
        // Check email already exists
        var user = await _repository.GetByEmailAsync(dto.Email);

        if (user != null)
        {
            return BadRequest("Email already exists.");
        }

        string hashPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var newUser = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = hashPassword,
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(newUser);

        await _unitOfWork.CommitAsync();

        return Ok("User Registered Successfully.");
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
}