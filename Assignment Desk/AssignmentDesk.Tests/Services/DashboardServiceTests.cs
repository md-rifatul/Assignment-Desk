using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Services;
using AutoMapper;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using System.Linq.Expressions;

namespace AssignmentDesk.Tests.Services
{
    [TestFixture]
    public class DashboardServiceTests
    {
        private Mock<IUserRepository> _userRepositoryMock = null!;
        private Mock<IClassRepository> _classRepositoryMock = null!;
        private Mock<ISubjectRepository> _subjectRepositoryMock = null!;
        private Mock<IAssignmentRepository> _assignmentRepositoryMock = null!;
        private Mock<ITeacherSubjectRepository> _teacherSubjectRepositoryMock = null!;
        private Mock<ISubmissionRepository> _submissionRepositoryMock = null!;
        private Mock<IStudentClassRepository> _studentClassRepositoryMock = null!;
        private Mock<IMapper> _mapperMock = null!;

        private DashboardService _dashboardService = null!;

        [SetUp]
        public void Setup()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _classRepositoryMock = new Mock<IClassRepository>();
            _subjectRepositoryMock = new Mock<ISubjectRepository>();
            _assignmentRepositoryMock = new Mock<IAssignmentRepository>();
            _teacherSubjectRepositoryMock = new Mock<ITeacherSubjectRepository>();
            _submissionRepositoryMock = new Mock<ISubmissionRepository>();
            _studentClassRepositoryMock = new Mock<IStudentClassRepository>();
            _mapperMock = new Mock<IMapper>();

            _dashboardService = new DashboardService(
                _userRepositoryMock.Object,
                _classRepositoryMock.Object,
                _subjectRepositoryMock.Object,
                _assignmentRepositoryMock.Object,
                _teacherSubjectRepositoryMock.Object,
                _submissionRepositoryMock.Object,
                _studentClassRepositoryMock.Object,
                _mapperMock.Object
            );
        }

        [Test]
        public async Task GetAdminDashboard_ShouldReturnCorrectCounts()
        {
            _userRepositoryMock
                .Setup(x => x.CountAsync(
                    It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync(5);

            _classRepositoryMock
                .Setup(x => x.CountAsync())
                .ReturnsAsync(3);

            _subjectRepositoryMock
                .Setup(x => x.CountAsync())
                .ReturnsAsync(8);

            _assignmentRepositoryMock
                .Setup(x => x.CountAsync())
                .ReturnsAsync(12);

            _assignmentRepositoryMock
                .Setup(x => x.GetAllAsync(
                    It.IsAny<Expression<Func<Assignment, bool>>>(),
                    It.IsAny<Func<IQueryable<Assignment>, IQueryable<Assignment>>>(),
                    It.IsAny<bool>()))
                .ReturnsAsync(new List<Assignment>());

            _submissionRepositoryMock
                .Setup(x => x.GetAllAsync(
                    It.IsAny<Expression<Func<Submission, bool>>>(),
                    It.IsAny<Func<IQueryable<Submission>, IQueryable<Submission>>>(),
                    It.IsAny<bool>()))
                .ReturnsAsync(new List<Submission>());

            var result =
                await _dashboardService.GetAdminDashboard();

            result.Should().NotBeNull();

            result.TotalTeachers
                .Should()
                .Be(5);

            result.TotalStudents
                .Should()
                .Be(5);

            result.TotalClasses
                .Should()
                .Be(3);

            result.TotalSubjects
                .Should()
                .Be(8);

            result.TotalAssignments
                .Should()
                .Be(12);

            _userRepositoryMock.Verify(
                x => x.CountAsync(
                    It.IsAny<Expression<Func<User, bool>>>()),
                Times.Exactly(2));

            _classRepositoryMock.Verify(
                x => x.CountAsync(),
                Times.Once);

            _subjectRepositoryMock.Verify(
                x => x.CountAsync(),
                Times.Once);

            _assignmentRepositoryMock.Verify(
                x => x.CountAsync(),
                Times.Once);
        }

        [Test]
        public async Task GetStudentDashboard_ShouldThrowException_WhenStudentIsNotAssignedToClass()
        {
            var studentId = 10;

            _studentClassRepositoryMock
                .Setup(x => x.GetByStudentIdAsync(studentId))
                .ReturnsAsync((StudentClass?)null);

            Func<Task> action = async () =>
                await _dashboardService.GetStudentDashboard(studentId);

            await action
                .Should()
                .ThrowAsync<Exception>()
                .WithMessage(
                    "Student is not assigned to any class.");

            _studentClassRepositoryMock.Verify(
                x => x.GetByStudentIdAsync(studentId),
                Times.Once);

            _subjectRepositoryMock.Verify(
                x => x.CountAsync(
                    It.IsAny<Expression<Func<Subject, bool>>>()),
                Times.Never);

            _assignmentRepositoryMock.Verify(
                x => x.CountAsync(
                    It.IsAny<Expression<Func<Assignment, bool>>>()),
                Times.Never);
        }

        [Test]
        public async Task GetStudentDashboard_ShouldReturnCorrectCounts()
        {
            var studentId = 10;
            var classId = 2;

            var studentClass = new StudentClass
            {
                StudentId = studentId,
                ClassId = classId
            };

            _studentClassRepositoryMock
                .Setup(x => x.GetByStudentIdAsync(studentId))
                .ReturnsAsync(studentClass);

            _subjectRepositoryMock
                .Setup(x => x.CountAsync(
                    It.IsAny<Expression<Func<Subject, bool>>>()))
                .ReturnsAsync(6);

            _assignmentRepositoryMock
                .Setup(x => x.CountAsync(
                    It.IsAny<Expression<Func<Assignment, bool>>>()))
                .ReturnsAsync(10);

            _submissionRepositoryMock
                .Setup(x => x.CountAsync(
                    It.IsAny<Expression<Func<Submission, bool>>>()))
                .ReturnsAsync(7);

            _assignmentRepositoryMock
                .Setup(x => x.CountPendingAssignmentsAsync(
                    studentId,
                    classId))
                .ReturnsAsync(3);

            _submissionRepositoryMock
                .Setup(x => x.GetPendingReviewCountAsync(
                    It.IsAny<int>()))
                .ReturnsAsync(0);

            _submissionRepositoryMock
                .Setup(x => x.CountAsync(
                    It.IsAny<Expression<Func<Submission, bool>>>()))
                .ReturnsAsync(7);

            var result =
                await _dashboardService.GetStudentDashboard(studentId);

            result.Should().NotBeNull();

            result.MySubjects
                .Should()
                .Be(6);

            result.MyAssignments
                .Should()
                .Be(10);

            result.SubmittedAssignments
                .Should()
                .Be(7);

            result.PendingAssignments
                .Should()
                .Be(3);

            result.ReviewedAssignments
                .Should()
                .Be(7);

            _studentClassRepositoryMock.Verify(
                x => x.GetByStudentIdAsync(studentId),
                Times.Once);

            _subjectRepositoryMock.Verify(
                x => x.CountAsync(
                    It.IsAny<Expression<Func<Subject, bool>>>()),
                Times.Once);

            _assignmentRepositoryMock.Verify(
                x => x.CountAsync(
                    It.IsAny<Expression<Func<Assignment, bool>>>()),
                Times.Once);

            _assignmentRepositoryMock.Verify(
                x => x.CountPendingAssignmentsAsync(
                    studentId,
                    classId),
                Times.Once);

            _submissionRepositoryMock.Verify(
                x => x.CountAsync(
                    It.IsAny<Expression<Func<Submission, bool>>>()),
                Times.Exactly(2));
        }

        [Test]
        public async Task GetTeacherDashboard_ShouldReturnCorrectCounts()
        {
            var teacherId = 20;

            _teacherSubjectRepositoryMock
                .Setup(x =>
                    x.GetSubjectCountByTeacherIdAsync(teacherId))
                .ReturnsAsync(4);

            _assignmentRepositoryMock
                .Setup(x =>
                    x.GetAssignmentCountByTeacherIdAsync(teacherId))
                .ReturnsAsync(9);

            _submissionRepositoryMock
                .Setup(x =>
                    x.GetPendingReviewCountAsync(teacherId))
                .ReturnsAsync(5);

            var result =
                await _dashboardService.GetTeacherDashboard(
                    teacherId);

            result.Should().NotBeNull();

            result.MySubjects
                .Should()
                .Be(4);

            result.MyAssignments
                .Should()
                .Be(9);

            result.PendingReview
                .Should()
                .Be(5);

            _teacherSubjectRepositoryMock.Verify(
                x =>
                    x.GetSubjectCountByTeacherIdAsync(teacherId),
                Times.Once);

            _assignmentRepositoryMock.Verify(
                x =>
                    x.GetAssignmentCountByTeacherIdAsync(teacherId),
                Times.Once);

            _submissionRepositoryMock.Verify(
                x =>
                    x.GetPendingReviewCountAsync(teacherId),
                Times.Once);
        }
    }
}