using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories.Auth;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Repositories
{
    [TestFixture]
    public class UserRepositoryTests
    {
        private ApplicationDbContext _context = null!;
        private Mock<IUnitOfWork> _unitOfWorkMock = null!;
        private UserRepository _userRepository = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);

            _unitOfWorkMock = new Mock<IUnitOfWork>();

            // CommitAsync ডাকলে যেন আসল InMemory DbContext-এ SaveChangesAsync এক্সিকিউট হয়
            _unitOfWorkMock
                .Setup(x => x.CommitAsync())
                .Returns(async () => await _context.SaveChangesAsync());

            _userRepository = new UserRepository(
                _context,
                _unitOfWorkMock.Object);
        }

        [TearDown]
        public async Task TearDown()
        {
            await _context.Database.EnsureDeletedAsync();
            await _context.DisposeAsync();
        }

        [Test]
        public async Task GetByEmailAsync_ShouldReturnUser_WhenEmailExists()
        {
            var user = new User
            {
                Id = 1,
                FullName = "Test User",
                Email = "test@gmail.com",
                PasswordHash = "hashed",
                Role = UserRole.Student
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var result = await _userRepository.GetByEmailAsync("test@gmail.com");

            result.Should().NotBeNull();
            result!.Email.Should().Be("test@gmail.com");
        }

        [Test]
        public async Task GetByEmailAsync_ShouldReturnNull_WhenEmailDoesNotExist()
        {
            var result = await _userRepository.GetByEmailAsync("notfound@gmail.com");

            result.Should().BeNull();
        }

        [Test]
        public async Task AddAsync_ShouldAddUser()
        {
            var user = new User
            {
                FullName = "Test Student",
                Email = "student@gmail.com",
                PasswordHash = "hashed",
                Role = UserRole.Student,
                IsActive = true
            };

            await _userRepository.AddAsync(user);

            var result = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == "student@gmail.com");

            result.Should().NotBeNull();
            result!.FullName.Should().Be("Test Student");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task UpdateAsync_ShouldUpdateUser()
        {
            var user = new User
            {
                Id = 1,
                FullName = "Old Name",
                Email = "test@gmail.com",
                PasswordHash = "hashed",
                Role = UserRole.Student
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            user.FullName = "Updated Name";

            await _userRepository.UpdateAsync(user);

            var result = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == 1);

            result.Should().NotBeNull();
            result!.FullName.Should().Be("Updated Name");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task DeleteAsync_ShouldDeleteUser()
        {
            var user = new User
            {
                Id = 1,
                FullName = "Delete User",
                Email = "delete@gmail.com",
                PasswordHash = "hashed",
                Role = UserRole.Student
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            await _userRepository.DeleteAsync(user);

            var result = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == 1);

            result.Should().BeNull();

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task GetUsers_ShouldReturnOnlyNonAdminUsers()
        {
            var users = new List<User>
            {
                new User
                {
                    Id = 1,
                    FullName = "Admin",
                    Email = "admin@gmail.com",
                    PasswordHash = "hashed",
                    Role = UserRole.Admin
                },
                new User
                {
                    Id = 2,
                    FullName = "Teacher",
                    Email = "teacher@gmail.com",
                    PasswordHash = "hashed",
                    Role = UserRole.Teacher
                },
                new User
                {
                    Id = 3,
                    FullName = "Student",
                    Email = "student@gmail.com",
                    PasswordHash = "hashed",
                    Role = UserRole.Student
                }
            };

            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();

            var result = await _userRepository.GetUsers();

            result.Should().HaveCount(2);
            result.Should().NotContain(x => x.Role == UserRole.Admin);
            result.Should().Contain(x => x.Role == UserRole.Teacher);
            result.Should().Contain(x => x.Role == UserRole.Student);
        }

        [Test]
        public async Task GetByIdAsync_ShouldReturnUser_WhenIdExists()
        {
            var user = new User
            {
                Id = 10,
                FullName = "Test User",
                Email = "test@gmail.com",
                PasswordHash = "hashed",
                Role = UserRole.Student
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var result = await _userRepository.GetByIdAsync(10);

            result.Should().NotBeNull();
            result!.Id.Should().Be(10);
        }

        [Test]
        public async Task GetByIdAsync_ShouldReturnNull_WhenIdDoesNotExist()
        {
            var result = await _userRepository.GetByIdAsync(999);

            result.Should().BeNull();
        }

        [Test]
        public async Task CountAsync_ShouldReturnCorrectCount()
        {
            var users = new List<User>
            {
                new User
                {
                    Id = 1,
                    FullName = "Teacher 1",
                    Email = "teacher1@gmail.com",
                    PasswordHash = "hashed",
                    Role = UserRole.Teacher
                },
                new User
                {
                    Id = 2,
                    FullName = "Teacher 2",
                    Email = "teacher2@gmail.com",
                    PasswordHash = "hashed",
                    Role = UserRole.Teacher
                },
                new User
                {
                    Id = 3,
                    FullName = "Student",
                    Email = "student@gmail.com",
                    PasswordHash = "hashed",
                    Role = UserRole.Student
                }
            };

            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();

            var result = await _userRepository.CountAsync(x => x.Role == UserRole.Teacher);

            result.Should().Be(2);
        }

        [Test]
        public async Task GetUserByEmail_ShouldReturnUser_WhenEmailExists()
        {
            var user = new User
            {
                Id = 1,
                FullName = "Test User",
                Email = "test@gmail.com",
                PasswordHash = "hashed",
                Role = UserRole.Student
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var result = await _userRepository.GetUserByEmail("test@gmail.com");

            result.Should().NotBeNull();
            result!.Email.Should().Be("test@gmail.com");
        }

        [Test]
        public async Task GetUserByResetTokenHashAsync_ShouldReturnUser_WhenTokenExists()
        {
            var user = new User
            {
                Id = 1,
                FullName = "Reset User",
                Email = "reset@gmail.com",
                PasswordHash = "hashed",
                PasswordResetTokenHash = "reset-token-hash",
                Role = UserRole.Student
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var result = await _userRepository.GetUserByResetTokenHashAsync("reset-token-hash");

            result.Should().NotBeNull();
            result!.PasswordResetTokenHash.Should().Be("reset-token-hash");
        }

        [Test]
        public async Task GetUserByResetTokenHashAsync_ShouldReturnNull_WhenTokenDoesNotExist()
        {
            var result = await _userRepository.GetUserByResetTokenHashAsync("invalid-token");

            result.Should().BeNull();
        }

        [Test]
        public async Task GetUserByActivationTokenHashAsync_ShouldReturnUser_WhenTokenExists()
        {
            var user = new User
            {
                Id = 1,
                FullName = "Activation User",
                Email = "activation@gmail.com",
                PasswordHash = "hashed",
                ActivationTokenHash = "activation-token-hash",
                Role = UserRole.Student
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var result = await _userRepository.GetUserByActivationTokenHashAsync("activation-token-hash");

            result.Should().NotBeNull();
            result!.ActivationTokenHash.Should().Be("activation-token-hash");
        }

        [Test]
        public async Task GetUserByActivationTokenHashAsync_ShouldReturnNull_WhenTokenDoesNotExist()
        {
            var result = await _userRepository.GetUserByActivationTokenHashAsync("invalid-token");

            result.Should().BeNull();
        }
    }
}