using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Repositories
{
    [TestFixture]
    public class SubjectRepositoryTests
    {
        private ApplicationDbContext _context = null!;
        private SubjectRepository _subjectRepository = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _subjectRepository = new SubjectRepository(_context);
        }

        [TearDown]
        public async Task TearDown()
        {
            await _context.Database.EnsureDeletedAsync();
            await _context.DisposeAsync();
        }

        [Test]
        public async Task CountAsync_ShouldReturnZero_WhenNoSubjectsExist()
        {
            var result = await _subjectRepository.CountAsync();

            result.Should().Be(0);
        }

        [Test]
        public async Task CountAsync_ShouldReturnTotalCount_WhenSubjectsExist()
        {
            var subjects = new List<Subject>
            {
                new Subject { Id = 1, Name = "Mathematics" },
                new Subject { Id = 2, Name = "Physics" },
                new Subject { Id = 3, Name = "Chemistry" }
            };

            await _context.Subjects.AddRangeAsync(subjects);
            await _context.SaveChangesAsync();

            var result = await _subjectRepository.CountAsync();

            result.Should().Be(3);
        }

        [Test]
        public async Task CountAsync_WithPredicate_ShouldReturnMatchingCount()
        {
            var subjects = new List<Subject>
            {
                new Subject { Id = 1, Name = "Mathematics" },
                new Subject { Id = 2, Name = "Physics" },
                new Subject { Id = 3, Name = "Chemistry" }
            };

            await _context.Subjects.AddRangeAsync(subjects);
            await _context.SaveChangesAsync();

            var result = await _subjectRepository.CountAsync(x => x.Name.StartsWith("P"));

            result.Should().Be(1);
        }

        [Test]
        public void SearchAsync_ShouldThrowNotImplementedException()
        {
            Func<Task> act = async () => await _subjectRepository.SearchAsync("Math");

            act.Should().ThrowAsync<NotImplementedException>();
        }
    }
}