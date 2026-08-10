using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Repositories
{
    [TestFixture]
    public class StudentClassRepositoryTests
    {
        private ApplicationDbContext _context = null!;
        private StudentClassRepository _studentClassRepository = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _studentClassRepository = new StudentClassRepository(_context);
        }

        [TearDown]
        public async Task TearDown()
        {
            await _context.Database.EnsureDeletedAsync();
            await _context.DisposeAsync();
        }

        [Test]
        public async Task ExistsAsync_ShouldReturnTrue_WhenMatchingRecordExists()
        {
            var studentClass = new StudentClass
            {
                StudentId = 1,
                ClassId = 10
            };

            await _context.StudentClasses.AddAsync(studentClass);
            await _context.SaveChangesAsync();

            var result = await _studentClassRepository.ExistsAsync(x => x.StudentId == 1 && x.ClassId == 10);

            result.Should().BeTrue();
        }

        [Test]
        public async Task ExistsAsync_ShouldReturnFalse_WhenNoMatchingRecordExists()
        {
            var studentClass = new StudentClass
            {
                StudentId = 1,
                ClassId = 10
            };

            await _context.StudentClasses.AddAsync(studentClass);
            await _context.SaveChangesAsync();

            var result = await _studentClassRepository.ExistsAsync(x => x.StudentId == 2);

            result.Should().BeFalse();
        }

        [Test]
        public async Task GetByStudentIdAsync_ShouldReturnStudentClass_WhenStudentIdExists()
        {
            var studentClass = new StudentClass
            {
                StudentId = 100,
                ClassId = 5
            };

            await _context.StudentClasses.AddAsync(studentClass);
            await _context.SaveChangesAsync();

            var result = await _studentClassRepository.GetByStudentIdAsync(100);

            result.Should().NotBeNull();
            result!.StudentId.Should().Be(100);
            result.ClassId.Should().Be(5);
        }

        [Test]
        public async Task GetByStudentIdAsync_ShouldReturnNull_WhenStudentIdDoesNotExist()
        {
            var studentClass = new StudentClass
            {
                StudentId = 100,
                ClassId = 5
            };

            await _context.StudentClasses.AddAsync(studentClass);
            await _context.SaveChangesAsync();

            var result = await _studentClassRepository.GetByStudentIdAsync(999);

            result.Should().BeNull();
        }
    }
}