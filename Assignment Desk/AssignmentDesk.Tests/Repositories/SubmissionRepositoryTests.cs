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
    public class SubmissionRepositoryTests
    {
        private ApplicationDbContext _context = null!;
        private SubmissionRepository _submissionRepository = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _submissionRepository = new SubmissionRepository(_context);
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
                    new User { Id = 100, FullName = "Student 100", Email = "student100@test.com" },
                    new User { Id = 200, FullName = "Student 200", Email = "student200@test.com" }
                );
            }

            if (!await _context.Subjects.AnyAsync())
            {
                await _context.Subjects.AddAsync(
                    new Subject { Id = 1, Name = "Subject 1" }
                );
            }

            if (!await _context.Classes.AnyAsync())
            {
                await _context.Classes.AddAsync(
                    new Class { Id = 1, Name = "Class 1" }
                );
            }

            if (!await _context.Assignments.AnyAsync())
            {
                await _context.Assignments.AddRangeAsync(
                    new Assignment
                    {
                        Id = 1,
                        Title = "Assignment 1",
                        Description = "Description 1",
                        TeacherId = 10,
                        SubjectId = 1,
                        ClassId = 1,
                        MaximumMarks = 100,
                        Deadline = DateTime.UtcNow.AddDays(2)
                    },
                    new Assignment
                    {
                        Id = 2,
                        Title = "Assignment 2",
                        Description = "Description 2",
                        TeacherId = 20,
                        SubjectId = 1,
                        ClassId = 1,
                        MaximumMarks = 100,
                        Deadline = DateTime.UtcNow.AddDays(2)
                    }
                );
            }

            await _context.SaveChangesAsync();
        }

        [Test]
        public async Task CountAsync_WithPredicate_ShouldReturnMatchingCount()
        {
            await SeedRelatedEntitiesAsync();

            var submissions = new List<Submission>
            {
                new Submission
                {
                    Id = 1,
                    AssignmentId = 1,
                    StudentId = 100,
                    FileUrl = "/file1.pdf",
                    Status = SubmissionStatus.Submitted,
                    SubmittedAt = DateTime.UtcNow
                },
                new Submission
                {
                    Id = 2,
                    AssignmentId = 1,
                    StudentId = 200,
                    FileUrl = "/file2.pdf",
                    Status = SubmissionStatus.Submitted,
                    SubmittedAt = DateTime.UtcNow
                }
            };

            await _context.Submissions.AddRangeAsync(submissions);
            await _context.SaveChangesAsync();

            var result = await _submissionRepository.CountAsync(x => x.StudentId == 100);

            result.Should().Be(1);
        }

        [Test]
        public async Task GetAllAssignmentsByStudentId_ShouldReturnSubmissionsForStudent()
        {
            await SeedRelatedEntitiesAsync();

            var submissions = new List<Submission>
            {
                new Submission
                {
                    Id = 1,
                    AssignmentId = 1,
                    StudentId = 100,
                    FileUrl = "/file1.pdf",
                    SubmittedAt = DateTime.UtcNow
                },
                new Submission
                {
                    Id = 2,
                    AssignmentId = 2,
                    StudentId = 100,
                    FileUrl = "/file2.pdf",
                    SubmittedAt = DateTime.UtcNow
                },
                new Submission
                {
                    Id = 3,
                    AssignmentId = 1,
                    StudentId = 200,
                    FileUrl = "/file3.pdf",
                    SubmittedAt = DateTime.UtcNow
                }
            };

            await _context.Submissions.AddRangeAsync(submissions);
            await _context.SaveChangesAsync();

            var result = await _submissionRepository.GetAllAssignmentsByStudentId(100);

            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.StudentId == 100);
        }

        [Test]
        public async Task GetByStudentAndAssignmentAsync_ShouldReturnSubmission_WhenExists()
        {
            await SeedRelatedEntitiesAsync();

            var submission = new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 100,
                FileUrl = "/file1.pdf",
                SubmittedAt = DateTime.UtcNow
            };

            await _context.Submissions.AddAsync(submission);
            await _context.SaveChangesAsync();

            var result = await _submissionRepository.GetByStudentAndAssignmentAsync(100, 1);

            result.Should().NotBeNull();
            result!.StudentId.Should().Be(100);
            result.AssignmentId.Should().Be(1);
        }

        [Test]
        public async Task GetByStudentAndAssignmentAsync_ShouldReturnNull_WhenNotExists()
        {
            await SeedRelatedEntitiesAsync();

            var submission = new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 100,
                FileUrl = "/file1.pdf",
                SubmittedAt = DateTime.UtcNow
            };

            await _context.Submissions.AddAsync(submission);
            await _context.SaveChangesAsync();

            var result = await _submissionRepository.GetByStudentAndAssignmentAsync(100, 2);

            result.Should().BeNull();
        }

        [Test]
        public async Task GetPendingReviewCountAsync_ShouldReturnCountOfSubmittedStatusForTeacher()
        {
            await SeedRelatedEntitiesAsync();

            var submissions = new List<Submission>
    {
        new Submission
        {
            Id = 1,
            AssignmentId = 1,
            StudentId = 100,
            FileUrl = "/file1.pdf",
            Status = SubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow
        },
        new Submission
        {
            Id = 2,
            AssignmentId = 1,
            StudentId = 200,
            FileUrl = "/file2.pdf",
            Status = SubmissionStatus.Reviewed,
            SubmittedAt = DateTime.UtcNow
        },
        new Submission
        {
            Id = 3,
            AssignmentId = 2, // TeacherId = 20
            StudentId = 100,
            FileUrl = "/file3.pdf",
            Status = SubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow
        }
    };

            await _context.Submissions.AddRangeAsync(submissions);
            await _context.SaveChangesAsync();

            var result = await _submissionRepository.GetPendingReviewCountAsync(10);

            result.Should().Be(1);
        }

        [Test]
        public async Task GetSubmissionsByTeacherAsync_ShouldReturnSubmissionsWithIncludes()
        {
            await SeedRelatedEntitiesAsync();

            var submissions = new List<Submission>
            {
                new Submission
                {
                    Id = 1,
                    AssignmentId = 1, // TeacherId = 10
                    StudentId = 100,
                    FileUrl = "/file1.pdf",
                    SubmittedAt = DateTime.UtcNow
                },
                new Submission
                {
                    Id = 2,
                    AssignmentId = 2, // TeacherId = 20
                    StudentId = 200,
                    FileUrl = "/file2.pdf",
                    SubmittedAt = DateTime.UtcNow
                }
            };

            await _context.Submissions.AddRangeAsync(submissions);
            await _context.SaveChangesAsync();

            var result = await _submissionRepository.GetSubmissionsByTeacherAsync(10);

            var list = result.ToList();
            list.Should().HaveCount(1);
            list.First().Assignment.Should().NotBeNull();
            list.First().Assignment.TeacherId.Should().Be(10);
            list.First().Student.Should().NotBeNull();
            list.First().Student.Id.Should().Be(100);
            list.First().Assignment.Subject.Should().NotBeNull();
        }

        [Test]
        public async Task GetSubmissionWithAssignmentAsyncBySubmissionId_ShouldReturnSubmissionWithAssignment()
        {
            await SeedRelatedEntitiesAsync();

            var submission = new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 100,
                FileUrl = "/file1.pdf",
                SubmittedAt = DateTime.UtcNow
            };

            await _context.Submissions.AddAsync(submission);
            await _context.SaveChangesAsync();

            var result = await _submissionRepository.GetSubmissionWithAssignmentAsyncBySubmissionId(1);

            result.Should().NotBeNull();
            result!.Id.Should().Be(1);
            result.Assignment.Should().NotBeNull();
            result.Assignment.Id.Should().Be(1);
        }
    }
}