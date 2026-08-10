using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Repositories
{
    [TestFixture]
    public class AssignmentRepositoryTests
    {
        private ApplicationDbContext _context = null!;
        private AssignmentRepository _assignmentRepository = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _assignmentRepository = new AssignmentRepository(_context);
        }

        [TearDown]
        public async Task TearDown()
        {
            await _context.Database.EnsureDeletedAsync();
            await _context.DisposeAsync();
        }

        private async Task SeedRelatedEntitiesAsync()
        {
            if (!await _context.Users.AnyAsync())
            {
                await _context.Users.AddRangeAsync(
                    new User { Id = 10, FullName = "Teacher 10", Email = "teacher10@test.com" },
                    new User { Id = 20, FullName = "Teacher 20", Email = "teacher20@test.com" },
                    new User { Id = 30, FullName = "Teacher 30", Email = "teacher30@test.com" }
                );
            }

            if (!await _context.Classes.AnyAsync())
            {
                await _context.Classes.AddRangeAsync(
                    new Class { Id = 1, Name = "Class 1" },
                    new Class { Id = 2, Name = "Class 2" },
                    new Class { Id = 3, Name = "Class 3" }
                );
            }

            if (!await _context.Subjects.AnyAsync())
            {
                await _context.Subjects.AddRangeAsync(
                    new Subject { Id = 1, Name = "Subject 1" },
                    new Subject { Id = 2, Name = "Subject 2" },
                    new Subject { Id = 3, Name = "Subject 3" },
                    new Subject { Id = 4, Name = "Subject 4" }
                );
            }

            await _context.SaveChangesAsync();
        }

        [Test]
        public async Task GetAssignmentByIdAndTeacherIdAsync_ShouldReturnAssignment_WhenAssignmentBelongsToTeacher()
        {
            await SeedRelatedEntitiesAsync();

            var assignment = new Assignment
            {
                Id = 1,
                Title = "Test Title",
                Description = "Test Description",
                TeacherId = 10,
                ClassId = 1,
                SubjectId = 1,
                Status = AssignmentStatus.Publish,
                MaximumMarks = 100,
                Deadline = DateTime.UtcNow.AddDays(2)
            };

            await _context.Assignments.AddAsync(assignment);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.GetAssignmentByIdAndTeacherIdAsync(1, 10);

            result.Should().NotBeNull();
            result!.Id.Should().Be(1);
            result.TeacherId.Should().Be(10);
        }

        [Test]
        public async Task GetAssignmentByIdAndTeacherIdAsync_ShouldReturnNull_WhenTeacherDoesNotOwnAssignment()
        {
            await SeedRelatedEntitiesAsync();

            var assignment = new Assignment
            {
                Id = 1,
                Title = "Test Title",
                Description = "Test Description",
                TeacherId = 10,
                ClassId = 1,
                SubjectId = 1,
                Status = AssignmentStatus.Publish,
                MaximumMarks = 100,
                Deadline = DateTime.UtcNow.AddDays(2)
            };

            await _context.Assignments.AddAsync(assignment);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.GetAssignmentByIdAndTeacherIdAsync(1, 20);

            result.Should().BeNull();
        }

        [Test]
        public async Task GetAllAssignmentsByTeacherIdAsync_ShouldReturnOnlyTeacherAssignments()
        {
            await SeedRelatedEntitiesAsync();

            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Title = "Test Title 1",
                    Description = "Test Description 1",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 2,
                    Title = "Test Title 2",
                    Description = "Test Description 2",
                    TeacherId = 10,
                    ClassId = 2,
                    SubjectId = 2,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 3,
                    Title = "Test Title 3",
                    Description = "Test Description 3",
                    TeacherId = 20,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                }
            };

            await _context.Assignments.AddRangeAsync(assignments);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.GetAllAssignmentsByTeacherIdAsync(10);

            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.TeacherId == 10);
        }

        [Test]
        public async Task GetAllAssignmentsByClassIdAsync_ShouldReturnOnlyPublishedAssignmentsOfClass()
        {
            await SeedRelatedEntitiesAsync();

            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Title = "Test Title 1",
                    Description = "Test Description 1",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 2,
                    Title = "Test Title 2",
                    Description = "Test Description 2",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 2,
                    Status = AssignmentStatus.Draft,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 3,
                    Title = "Test Title 3",
                    Description = "Test Description 3",
                    TeacherId = 20,
                    ClassId = 2,
                    SubjectId = 3,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                }
            };

            await _context.Assignments.AddRangeAsync(assignments);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.GetAllAssignmentsByClassIdAsync(1);

            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().Id.Should().Be(1);
            result.First().Status.Should().Be(AssignmentStatus.Publish);
            result.First().ClassId.Should().Be(1);
        }

        [Test]
        public async Task CountAsync_ShouldReturnTotalAssignmentCount()
        {
            await SeedRelatedEntitiesAsync();

            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Title = "Test Title 1",
                    Description = "Test Description 1",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 2,
                    Title = "Test Title 2",
                    Description = "Test Description 2",
                    TeacherId = 20,
                    ClassId = 2,
                    SubjectId = 2,
                    Status = AssignmentStatus.Draft,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 3,
                    Title = "Test Title 3",
                    Description = "Test Description 3",
                    TeacherId = 30,
                    ClassId = 3,
                    SubjectId = 3,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                }
            };

            await _context.Assignments.AddRangeAsync(assignments);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.CountAsync();

            result.Should().Be(3);
        }

        [Test]
        public async Task GetAssignmentCountByTeacherIdAsync_ShouldCountOnlyPublishedAssignments()
        {
            await SeedRelatedEntitiesAsync();

            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Title = "Test Title 1",
                    Description = "Test Description 1",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 2,
                    Title = "Test Title 2",
                    Description = "Test Description 2",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 2,
                    Status = AssignmentStatus.Draft,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 3,
                    Title = "Test Title 3",
                    Description = "Test Description 3",
                    TeacherId = 10,
                    ClassId = 2,
                    SubjectId = 3,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 4,
                    Title = "Test Title 4",
                    Description = "Test Description 4",
                    TeacherId = 20,
                    ClassId = 2,
                    SubjectId = 4,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                }
            };

            await _context.Assignments.AddRangeAsync(assignments);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.GetAssignmentCountByTeacherIdAsync(10);

            result.Should().Be(2);
        }

        [Test]
        public async Task CountAsync_WithPredicate_ShouldReturnMatchingAssignments()
        {
            await SeedRelatedEntitiesAsync();

            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Title = "Test Title 1",
                    Description = "Test Description 1",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 2,
                    Title = "Test Title 2",
                    Description = "Test Description 2",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 2,
                    Status = AssignmentStatus.Draft,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 3,
                    Title = "Test Title 3",
                    Description = "Test Description 3",
                    TeacherId = 20,
                    ClassId = 2,
                    SubjectId = 3,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                }
            };

            await _context.Assignments.AddRangeAsync(assignments);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.CountAsync(x => x.Status == AssignmentStatus.Publish);

            result.Should().Be(2);
        }

        [Test]
        public async Task CountPendingAssignmentsAsync_ShouldReturnAssignmentsNotSubmittedByStudent()
        {
            await SeedRelatedEntitiesAsync();

            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Title = "Test Title 1",
                    Description = "Test Description 1",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 2,
                    Title = "Test Title 2",
                    Description = "Test Description 2",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 2,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 3,
                    Title = "Test Title 3",
                    Description = "Test Description 3",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 3,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                }
            };

            await _context.Assignments.AddRangeAsync(assignments);

            var submission = new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 100,
                FileUrl = "/test.pdf",
                SubmittedAt = DateTime.UtcNow
            };

            await _context.Submissions.AddAsync(submission);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.CountPendingAssignmentsAsync(100, 1);

            result.Should().Be(2);
        }

        [Test]
        public async Task CountPendingAssignmentsAsync_ShouldReturnZero_WhenStudentSubmittedAllAssignments()
        {
            await SeedRelatedEntitiesAsync();

            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Title = "Test Title 1",
                    Description = "Test Description 1",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 2,
                    Title = "Test Title 2",
                    Description = "Test Description 2",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 2,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                }
            };

            await _context.Assignments.AddRangeAsync(assignments);

            var submissions = new List<Submission>
            {
                new Submission
                {
                    Id = 1,
                    AssignmentId = 1,
                    StudentId = 100,
                    FileUrl = "/test1.pdf",
                    SubmittedAt = DateTime.UtcNow
                },
                new Submission
                {
                    Id = 2,
                    AssignmentId = 2,
                    StudentId = 100,
                    FileUrl = "/test2.pdf",
                    SubmittedAt = DateTime.UtcNow
                }
            };

            await _context.Submissions.AddRangeAsync(submissions);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.CountPendingAssignmentsAsync(100, 1);

            result.Should().Be(0);
        }

        [Test]
        public async Task CountPendingAssignmentsAsync_ShouldIgnoreDraftAssignments()
        {
            await SeedRelatedEntitiesAsync();

            var assignments = new List<Assignment>
            {
                new Assignment
                {
                    Id = 1,
                    Title = "Test Title 1",
                    Description = "Test Description 1",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 1,
                    Status = AssignmentStatus.Publish,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                },
                new Assignment
                {
                    Id = 2,
                    Title = "Test Title 2",
                    Description = "Test Description 2",
                    TeacherId = 10,
                    ClassId = 1,
                    SubjectId = 2,
                    Status = AssignmentStatus.Draft,
                    MaximumMarks = 100,
                    Deadline = DateTime.UtcNow.AddDays(2)
                }
            };

            await _context.Assignments.AddRangeAsync(assignments);
            await _context.SaveChangesAsync();

            var result = await _assignmentRepository.CountPendingAssignmentsAsync(100, 1);

            result.Should().Be(1);
        }
    }
}