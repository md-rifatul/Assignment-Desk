using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Repositories
{
    [TestFixture]
    public class ClassRepositoryTests
    {
        private ApplicationDbContext _context = null!;
        private ClassRepository _classRepository = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _classRepository = new ClassRepository(_context);
        }

        [TearDown]
        public async Task TearDown()
        {
            await _context.Database.EnsureDeletedAsync();
            await _context.DisposeAsync();
        }

        [Test]
        public async Task CountAsync_ShouldReturnZero_WhenNoClassesExist()
        {
            var result = await _classRepository.CountAsync();

            result.Should().Be(0);
        }

        [Test]
        public async Task CountAsync_ShouldReturnCorrectCount_WhenClassesExist()
        {
            var classes = new List<Class>
            {
                new Class { Id = 1, Name = "Class 1" },
                new Class { Id = 2, Name = "Class 2" },
                new Class { Id = 3, Name = "Class 3" }
            };

            await _context.Classes.AddRangeAsync(classes);
            await _context.SaveChangesAsync();

            var result = await _classRepository.CountAsync();

            result.Should().Be(3);
        }

        [Test]
        public void SearchAsync_ShouldThrowNotImplementedException()
        {
            Func<Task> act = async () => await _classRepository.SearchAsync("Test");

            act.Should().ThrowAsync<NotImplementedException>();
        }
    }
}