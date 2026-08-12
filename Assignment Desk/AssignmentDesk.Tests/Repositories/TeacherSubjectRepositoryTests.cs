using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Repositories
{
    [TestFixture]
    public class TeacherSubjectRepositoryTests
    {
        private ApplicationDbContext _context = null!;
        private TeacherSubjectRepository _teacherSubjectRepository = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _teacherSubjectRepository = new TeacherSubjectRepository(_context);
        }

        [TearDown]
        public async Task TearDown()
        {
            await _context.Database.EnsureDeletedAsync();
            await _context.DisposeAsync();
        }

        [Test]
        public async Task GetSubjectCountByTeacherIdAsync_ShouldReturnCorrectCount_WhenTeacherHasSubjects()
        {
            var teacherSubjects = new List<TeacherSubject>
            {
                new TeacherSubject { TeacherId = 10, SubjectId = 1 },
                new TeacherSubject { TeacherId = 10, SubjectId = 2 },
                new TeacherSubject { TeacherId = 20, SubjectId = 1 }
            };

            await _context.TeacherSubjects.AddRangeAsync(teacherSubjects);
            await _context.SaveChangesAsync();

            var result = await _teacherSubjectRepository.GetSubjectCountByTeacherIdAsync(10);

            result.Should().Be(2);
        }

        [Test]
        public async Task GetSubjectCountByTeacherIdAsync_ShouldReturnZero_WhenTeacherHasNoSubjects()
        {
            var teacherSubjects = new List<TeacherSubject>
            {
                new TeacherSubject { TeacherId = 10, SubjectId = 1 }
            };

            await _context.TeacherSubjects.AddRangeAsync(teacherSubjects);
            await _context.SaveChangesAsync();

            var result = await _teacherSubjectRepository.GetSubjectCountByTeacherIdAsync(99);

            result.Should().Be(0);
        }

        [Test]
        public void SearchAsync_ShouldThrowNotImplementedException()
        {
            Func<Task> act = async () => await _teacherSubjectRepository.SearchAsync("Math");

            act.Should().ThrowAsync<NotImplementedException>();
        }
    }
}