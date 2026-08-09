using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Application.Services;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using AutoMapper;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Services
{
    [TestFixture]
    public class SubmissionServiceTests
    {
        private Mock<ISubmissionRepository> _submissionRepositoryMock = null!;
        private Mock<IAssignmentRepository> _assignmentRepositoryMock = null!;
        private Mock<IUnitOfWork> _unitOfWorkMock = null!;
        private Mock<IMapper> _mapperMock = null!;

        private SubmissionService _submissionService = null!;

        [SetUp]
        public void Setup()
        {
            _submissionRepositoryMock = new Mock<ISubmissionRepository>();
            _assignmentRepositoryMock = new Mock<IAssignmentRepository>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _mapperMock = new Mock<IMapper>();

            _submissionService = new SubmissionService(
                _submissionRepositoryMock.Object,
                _assignmentRepositoryMock.Object,
                _unitOfWorkMock.Object,
                _mapperMock.Object
            );
        }

        [Test]
        public async Task GetAllSubmissions_ShouldReturnStudentSubmissions()
        {
            var studentId = 1;

            var submissions = new List<Submission>
            {
                new Submission
                {
                    Id = 1,
                    StudentId = studentId
                },
                new Submission
                {
                    Id = 2,
                    StudentId = studentId
                }
            };

            var expectedResult = new List<SubmissionResponseDto>
            {
                new SubmissionResponseDto(),
                new SubmissionResponseDto()
            };

            _submissionRepositoryMock
                .Setup(x => x.GetAllAssignmentsByStudentId(studentId))
                .ReturnsAsync(submissions);

            _mapperMock
                .Setup(x => x.Map<IEnumerable<SubmissionResponseDto>>(submissions))
                .Returns(expectedResult);

            var result =
                await _submissionService.GetAllSubmissions(studentId);

            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            _submissionRepositoryMock.Verify(
                x => x.GetAllAssignmentsByStudentId(studentId),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<IEnumerable<SubmissionResponseDto>>(submissions),
                Times.Once);
        }

        [Test]
        public async Task GetStudentSubmissions_ShouldReturnSubmissions()
        {
            var teacherId = 1;

            var submissions = new List<Submission>
            {
                new Submission
                {
                    Id = 1
                },
                new Submission
                {
                    Id = 2
                }
            };

            var expectedResult = new List<SubmissionResponseDto>
            {
                new SubmissionResponseDto(),
                new SubmissionResponseDto()
            };

            _submissionRepositoryMock
                .Setup(x => x.GetSubmissionsByTeacherAsync(teacherId))
                .ReturnsAsync(submissions);

            _mapperMock
                .Setup(x => x.Map<IEnumerable<SubmissionResponseDto>>(submissions))
                .Returns(expectedResult);

            var result =
                await _submissionService.GetStudentSubmissions(teacherId);

            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            _submissionRepositoryMock.Verify(
                x => x.GetSubmissionsByTeacherAsync(teacherId),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<IEnumerable<SubmissionResponseDto>>(submissions),
                Times.Once);
        }

        [Test]
        public async Task GetSubmission_ShouldReturnSubmission()
        {
            var studentId = 1;
            var assignmentId = 2;

            var submission = new Submission
            {
                Id = 1,
                StudentId = studentId,
                AssignmentId = assignmentId
            };

            var expectedResult = new SubmissionResponseDto();

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetByStudentAndAssignmentAsync(
                        studentId,
                        assignmentId))
                .ReturnsAsync(submission);

            _mapperMock
                .Setup(x => x.Map<SubmissionResponseDto>(submission))
                .Returns(expectedResult);

            var result =
                await _submissionService.GetSubmission(
                    studentId,
                    assignmentId);

            result.Should().NotBeNull();
            result.Should().Be(expectedResult);

            _submissionRepositoryMock.Verify(
                x =>
                    x.GetByStudentAndAssignmentAsync(
                        studentId,
                        assignmentId),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<SubmissionResponseDto>(submission),
                Times.Once);
        }

        [Test]
        public async Task Resubmit_ShouldThrowException_WhenSubmissionDoesNotExist()
        {
            var studentId = 1;
            var assignmentId = 2;

            var dto = new ResubmitSubmissionDto();

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetByStudentAndAssignmentAsync(
                        studentId,
                        assignmentId))
                .ReturnsAsync((Submission?)null);

            Func<Task> action = async () =>
                await _submissionService.Resubmit(
                    assignmentId,
                    studentId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Submission not found.");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task Resubmit_ShouldThrowException_WhenSubmissionBelongsToAnotherStudent()
        {
            var studentId = 1;
            var assignmentId = 2;

            var submission = new Submission
            {
                Id = 1,
                StudentId = 5,
                AssignmentId = assignmentId
            };

            var dto = new ResubmitSubmissionDto();

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetByStudentAndAssignmentAsync(
                        studentId,
                        assignmentId))
                .ReturnsAsync(submission);

            Func<Task> action = async () =>
                await _submissionService.Resubmit(
                    assignmentId,
                    studentId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("You are not authorized.");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task Resubmit_ShouldThrowException_WhenAssignmentDoesNotExist()
        {
            var studentId = 1;
            var assignmentId = 2;

            var submission = new Submission
            {
                Id = 1,
                StudentId = studentId,
                AssignmentId = assignmentId
            };

            var dto = new ResubmitSubmissionDto();

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetByStudentAndAssignmentAsync(
                        studentId,
                        assignmentId))
                .ReturnsAsync(submission);

            _assignmentRepositoryMock
                .Setup(x => x.GetByIdAsync(assignmentId, null))
                .ReturnsAsync((Assignment?)null);

            Func<Task> action = async () =>
                await _submissionService.Resubmit(
                    assignmentId,
                    studentId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Assignment not found.");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task ReviewSubmission_ShouldThrowException_WhenSubmissionDoesNotExist()
        {
            var submissionId = 1;
            var teacherId = 2;

            var dto = new ReviewSubmissionDto
            {
                Marks = 80,
                Feedback = "Good"
            };

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetSubmissionWithAssignmentAsyncBySubmissionId(
                        submissionId))
                .ReturnsAsync((Submission?)null);

            Func<Task> action = async () =>
                await _submissionService.ReviewSubmission(
                    submissionId,
                    teacherId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Submission not found.");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task ReviewSubmission_ShouldThrowException_WhenTeacherIsNotAuthorized()
        {
            var submissionId = 1;
            var teacherId = 2;

            var assignment = new Assignment
            {
                TeacherId = 5,
                MaximumMarks = 100
            };

            var submission = new Submission
            {
                Id = submissionId,
                Assignment = assignment
            };

            var dto = new ReviewSubmissionDto
            {
                Marks = 80,
                Feedback = "Good"
            };

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetSubmissionWithAssignmentAsyncBySubmissionId(
                        submissionId))
                .ReturnsAsync(submission);

            Func<Task> action = async () =>
                await _submissionService.ReviewSubmission(
                    submissionId,
                    teacherId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Your are not allowed for review");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task ReviewSubmission_ShouldThrowException_WhenMarksExceedMaximumMarks()
        {
            var submissionId = 1;
            var teacherId = 2;

            var assignment = new Assignment
            {
                TeacherId = teacherId,
                MaximumMarks = 50
            };

            var submission = new Submission
            {
                Id = submissionId,
                Assignment = assignment
            };

            var dto = new ReviewSubmissionDto
            {
                Marks = 60,
                Feedback = "Good"
            };

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetSubmissionWithAssignmentAsyncBySubmissionId(
                        submissionId))
                .ReturnsAsync(submission);

            Func<Task> action = async () =>
                await _submissionService.ReviewSubmission(
                    submissionId,
                    teacherId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Marks exceed maximum marks.");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task ReviewSubmission_ShouldThrowException_WhenMarksAreNegative()
        {
            var submissionId = 1;
            var teacherId = 2;

            var assignment = new Assignment
            {
                TeacherId = teacherId,
                MaximumMarks = 100
            };

            var submission = new Submission
            {
                Id = submissionId,
                Assignment = assignment
            };

            var dto = new ReviewSubmissionDto
            {
                Marks = -1,
                Feedback = "Invalid"
            };

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetSubmissionWithAssignmentAsyncBySubmissionId(
                        submissionId))
                .ReturnsAsync(submission);

            Func<Task> action = async () =>
                await _submissionService.ReviewSubmission(
                    submissionId,
                    teacherId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Invalid Marks");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task ReviewSubmission_ShouldReviewSubmission_WhenDataIsValid()
        {
            var submissionId = 1;
            var teacherId = 2;

            var assignment = new Assignment
            {
                TeacherId = teacherId,
                MaximumMarks = 100
            };

            var submission = new Submission
            {
                Id = submissionId,
                Assignment = assignment
            };

            var dto = new ReviewSubmissionDto
            {
                Marks = 85,
                Feedback = "Very good"
            };

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetSubmissionWithAssignmentAsyncBySubmissionId(
                        submissionId))
                .ReturnsAsync(submission);

            await _submissionService.ReviewSubmission(
                submissionId,
                teacherId,
                dto);

            submission.Marks.Should().Be(85);
            submission.Feedback.Should().Be("Very good");
            submission.Status.Should().Be(SubmissionStatus.Reviewed);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task UploadSubmission_ShouldThrowException_WhenAssignmentDoesNotExist()
        {
            var studentId = 1;

            var dto = new CreateSubmissionDto
            {
                AssignmentId = 10
            };

            _assignmentRepositoryMock
                .Setup(x => x.GetByIdAsync(10, null))
                .ReturnsAsync((Assignment?)null);

            Func<Task> action = async () =>
                await _submissionService.UploadSubmission(
                    studentId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Assignment not found");

            _submissionRepositoryMock.Verify(
                x => x.AddAsync(
                    It.IsAny<Submission>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task UploadSubmission_ShouldThrowException_WhenAssignmentIsNotPublished()
        {
            var studentId = 1;

            var assignment = new Assignment
            {
                Id = 10,
                Status = AssignmentStatus.Draft,
                Deadline = DateTime.UtcNow.AddDays(1)
            };

            var dto = new CreateSubmissionDto
            {
                AssignmentId = 10
            };

            _assignmentRepositoryMock
                .Setup(x => x.GetByIdAsync(10, null))
                .ReturnsAsync(assignment);

            Func<Task> action = async () =>
                await _submissionService.UploadSubmission(
                    studentId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Assignment is not publish");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task UploadSubmission_ShouldThrowException_WhenDeadlineIsOver()
        {
            var studentId = 1;

            var assignment = new Assignment
            {
                Id = 10,
                Status = AssignmentStatus.Publish,
                Deadline = DateTime.UtcNow.AddMinutes(-10)
            };

            var dto = new CreateSubmissionDto
            {
                AssignmentId = 10
            };

            _assignmentRepositoryMock
                .Setup(x => x.GetByIdAsync(10, null))
                .ReturnsAsync(assignment);

            Func<Task> action = async () =>
                await _submissionService.UploadSubmission(
                    studentId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("Submission Dadeline is over");

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task UploadSubmission_ShouldThrowException_WhenAlreadySubmitted()
        {
            var studentId = 1;

            var assignment = new Assignment
            {
                Id = 10,
                Status = AssignmentStatus.Publish,
                Deadline = DateTime.UtcNow.AddDays(1)
            };

            var existingSubmission = new Submission
            {
                Id = 1,
                StudentId = studentId,
                AssignmentId = assignment.Id
            };

            var dto = new CreateSubmissionDto
            {
                AssignmentId = assignment.Id
            };

            _assignmentRepositoryMock
                .Setup(x => x.GetByIdAsync(10, null))
                .ReturnsAsync(assignment);

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetByStudentAndAssignmentAsync(
                        studentId,
                        assignment.Id))
                .ReturnsAsync(existingSubmission);

            Func<Task> action = async () =>
                await _submissionService.UploadSubmission(
                    studentId,
                    dto);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage("You have already submitted this assignment.");

            _submissionRepositoryMock.Verify(
                x => x.AddAsync(
                    It.IsAny<Submission>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }
    }
}