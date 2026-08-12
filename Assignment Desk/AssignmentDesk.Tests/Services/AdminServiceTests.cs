using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Application.Services;
using AssignmentDesk.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Services;

[TestFixture]
public class AdminServiceTests
{
    private Mock<IUserRepository> _userRepositoryMock = null!;
    private Mock<IUnitOfWork> _unitOfWorkMock = null!;
    private Mock<IMapper> _mapperMock = null!;
    private Mock<IEmailService> _emailServiceMock = null!;
    private Mock<IConfiguration> _configurationMock = null!;

    private AdminService _adminService = null!;

    [SetUp]
    public void Setup()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _emailServiceMock = new Mock<IEmailService>();
        _configurationMock = new Mock<IConfiguration>();

        _configurationMock
            .Setup(x => x["AppSettings:ClientBaseUrl"])
            .Returns("http://localhost:3000");

        _adminService = new AdminService(
            _userRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _mapperMock.Object,
            _emailServiceMock.Object,
            _configurationMock.Object
        );
    }


    // =========================================================
    // CREATE
    // =========================================================

    [Test]
    public async Task Create_ShouldThrowException_WhenEmailAlreadyExists()
    {
        // Arrange
        var dto = new RegisterDto
        {
            FullName = "Rifatul Islam",
            Email = "rifatul@gmail.com"
        };

        var existingUser = new User
        {
            Id = 1,
            FullName = "Existing User",
            Email = dto.Email
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(dto.Email))
            .ReturnsAsync(existingUser);


        // Act
        Func<Task> action = async () =>
            await _adminService.Create(dto);


        // Assert
        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Email already exists.");

        _userRepositoryMock.Verify(
            x => x.GetByEmailAsync(dto.Email),
            Times.Once);

        _userRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<User>()),
            Times.Never);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);

        _emailServiceMock.Verify(
            x => x.SendAccountActivationEmailAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>()),
            Times.Never);
    }


    [Test]
    public async Task Create_ShouldCreateUser_WhenEmailDoesNotExist()
    {
        // Arrange
        var dto = new RegisterDto
        {
            FullName = "Rifatul Islam",
            Email = "rifatul@gmail.com"
        };

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _mapperMock
            .Setup(x => x.Map<User>(dto))
            .Returns(user);


        // Act
        await _adminService.Create(dto);


        // Assert

        user.IsActive.Should().BeFalse();

        user.ActivationTokenHash
            .Should()
            .NotBeNullOrWhiteSpace();

        user.ActivationTokenExpiry
            .Should()
            .NotBeNull();

        user.CreatedAt
            .Should()
            .BeCloseTo(
                DateTime.UtcNow,
                TimeSpan.FromSeconds(5));

        _userRepositoryMock.Verify(
            x => x.AddAsync(
                It.Is<User>(u =>
                    u.Email == dto.Email &&
                    u.FullName == dto.FullName &&
                    u.IsActive == false &&
                    u.ActivationTokenHash != null &&
                    u.ActivationTokenExpiry != null
                )),
            Times.Once);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Once);

        _emailServiceMock.Verify(
            x => x.SendAccountActivationEmailAsync(
                dto.Email,
                dto.FullName,
                It.Is<string>(link =>
                    link.StartsWith(
                        "http://localhost:3000/activate-account?token=")
                )),
            Times.Once);
    }


    // =========================================================
    // DELETE
    // =========================================================

    [Test]
    public async Task Delete_ShouldDeleteUser_WhenUserExists()
    {
        // Arrange
        var userId = 1;

        var user = new User
        {
            Id = userId,
            FullName = "Rifatul Islam",
            Email = "rifatul@gmail.com"
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);


        // Act
        await _adminService.Delete(userId);


        // Assert

        _userRepositoryMock.Verify(
            x => x.GetByIdAsync(userId),
            Times.Once);

        _userRepositoryMock.Verify(
            x => x.DeleteAsync(user),
            Times.Once);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Once);
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    [Test]
    public async Task GetById_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var userId = 1;

        var user = new User
        {
            Id = userId,
            FullName = "Rifatul Islam",
            Email = "rifatul@gmail.com"
        };

        var expectedDto = new UserResponseDto
        {
            FullName = "Rifatul Islam",
            Email = "rifatul@gmail.com"
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        _mapperMock
            .Setup(x => x.Map<UserResponseDto>(user))
            .Returns(expectedDto);


        // Act
        var result = await _adminService.GetById(userId);


        // Assert

        result.Should().NotBeNull();

        result.FullName
            .Should()
            .Be("Rifatul Islam");

        result.Email
            .Should()
            .Be("rifatul@gmail.com");

        _userRepositoryMock.Verify(
            x => x.GetByIdAsync(userId),
            Times.Once);

        _mapperMock.Verify(
            x => x.Map<UserResponseDto>(user),
            Times.Once);
    }


    // =========================================================
    // GET USERS
    // =========================================================

    [Test]
    public async Task GetUsers_ShouldReturnAllUsers()
    {
        // Arrange

        var users = new List<User>
        {
            new User
            {
                Id = 1,
                FullName = "Rifatul Islam",
                Email = "rifatul@gmail.com"
            },

            new User
            {
                Id = 2,
                FullName = "Test Teacher",
                Email = "teacher@gmail.com"
            }
        };

        var expectedDtos = new List<UserResponseDto>
        {
            new UserResponseDto
            {
                FullName = "Rifatul Islam",
                Email = "rifatul@gmail.com"
            },

            new UserResponseDto
            {
                FullName = "Test Teacher",
                Email = "teacher@gmail.com"
            }
        };

        _userRepositoryMock
            .Setup(x => x.GetUsers())
            .ReturnsAsync(users);

        _mapperMock
            .Setup(x =>
                x.Map<IEnumerable<UserResponseDto>>(users))
            .Returns(expectedDtos);


        // Act

        var result = await _adminService.GetUsers();


        // Assert

        result.Should().NotBeNull();

        result.Should().HaveCount(2);

        result.First().FullName
            .Should()
            .Be("Rifatul Islam");

        _userRepositoryMock.Verify(
            x => x.GetUsers(),
            Times.Once);

        _mapperMock.Verify(
            x => x.Map<IEnumerable<UserResponseDto>>(users),
            Times.Once);
    }


    // =========================================================
    // UPDATE
    // =========================================================

    [Test]
    public async Task Update_ShouldUpdateUser_WhenUserExists()
    {
        // Arrange

        var userId = 1;

        var dto = new RegisterDto
        {
            FullName = "Updated Name",
            Email = "updated@gmail.com"
        };

        var user = new User
        {
            Id = userId,
            FullName = "Old Name",
            Email = "old@gmail.com"
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);


        // Act

        await _adminService.Update(userId, dto);


        // Assert

        _userRepositoryMock.Verify(
            x => x.GetByIdAsync(userId),
            Times.Once);

        _mapperMock.Verify(
            x => x.Map(dto, user),
            Times.Once);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Once);
    }
}