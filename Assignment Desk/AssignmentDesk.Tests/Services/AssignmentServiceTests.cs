using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Application.Services;
using AssignmentDesk.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Services;

[TestFixture]
public class AssignmentServiceTests
{
    private Mock<IAssignmentRepository> _assignmentRepositoryMock = null!;
    private Mock<ISubjectRepository> _subjectRepositoryMock = null!;
    private Mock<IClassRepository> _classRepositoryMock = null!;
    private Mock<IStudentClassRepository> _studentClassRepositoryMock = null!;
    private Mock<IUnitOfWork> _unitOfWorkMock = null!;
    private Mock<IMapper> _mapperMock = null!;

    private AssignmentService _assignmentService = null!;

    [SetUp]
    public void Setup()
    {
        _assignmentRepositoryMock = new Mock<IAssignmentRepository>();
        _subjectRepositoryMock = new Mock<ISubjectRepository>();
        _classRepositoryMock = new Mock<IClassRepository>();
        _studentClassRepositoryMock = new Mock<IStudentClassRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();

        _assignmentService = new AssignmentService(
            _assignmentRepositoryMock.Object,
            _subjectRepositoryMock.Object,
            _classRepositoryMock.Object,
            _studentClassRepositoryMock.Object,
            _assignmentRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _mapperMock.Object
        );
    }

    [Test]
    public async Task AddAssignment_ShouldThrowException_WhenSubjectDoesNotExist()
    {
        var dto = new CreateAssignmentDto
        {
            SubjectId = 1,
            ClassId = 1
        };

        _subjectRepositoryMock
            .Setup(x => x.GetByIdAsync(
                dto.SubjectId,
                null))
            .ReturnsAsync((Subject?)null);

        Func<Task> action = async () =>
            await _assignmentService.AddAssignment(1, dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Subject not found.");

        _classRepositoryMock.Verify(
            x => x.GetByIdAsync(
                It.IsAny<int>(),
                null),
            Times.Never);

        _assignmentRepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<Assignment>()),
            Times.Never);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);
    }

    [Test]
    public async Task AddAssignment_ShouldThrowException_WhenClassDoesNotExist()
    {
        var dto = new CreateAssignmentDto
        {
            SubjectId = 1,
            ClassId = 1
        };

        var subject = new Subject
        {
            Id = 1,
            ClassId = 1
        };

        _subjectRepositoryMock
            .Setup(x => x.GetByIdAsync(
                dto.SubjectId,
                null))
            .ReturnsAsync(subject);

        _classRepositoryMock
            .Setup(x => x.GetByIdAsync(
                dto.ClassId,
                null))
            .ReturnsAsync((Class?)null);

        Func<Task> action = async () =>
            await _assignmentService.AddAssignment(1, dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage("Class not found.");

        _assignmentRepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<Assignment>()),
            Times.Never);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);
    }

    [Test]
    public async Task AddAssignment_ShouldThrowException_WhenSubjectDoesNotBelongToClass()
    {
        var dto = new CreateAssignmentDto
        {
            SubjectId = 1,
            ClassId = 2
        };

        var subject = new Subject
        {
            Id = 1,
            ClassId = 1
        };

        var classEntity = new Class
        {
            Id = 2
        };

        _subjectRepositoryMock
            .Setup(x => x.GetByIdAsync(
                dto.SubjectId,
                null))
            .ReturnsAsync(subject);

        _classRepositoryMock
            .Setup(x => x.GetByIdAsync(
                dto.ClassId,
                null))
            .ReturnsAsync(classEntity);

        Func<Task> action = async () =>
            await _assignmentService.AddAssignment(10, dto);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage(
                "Selected subject does not belong to the selected class.");

        _assignmentRepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<Assignment>()),
            Times.Never);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Never);
    }

    [Test]
    public async Task AddAssignment_ShouldCreateAssignment_WhenDataIsValid()
    {
        var teacherId = 10;

        var dto = new CreateAssignmentDto
        {
            SubjectId = 1,
            ClassId = 2
        };

        var subject = new Subject
        {
            Id = 1,
            ClassId = 2
        };

        var classEntity = new Class
        {
            Id = 2
        };

        var assignment = new Assignment
        {
            SubjectId = dto.SubjectId,
            ClassId = dto.ClassId
        };

        _subjectRepositoryMock
            .Setup(x => x.GetByIdAsync(
                dto.SubjectId,
                null))
            .ReturnsAsync(subject);

        _classRepositoryMock
            .Setup(x => x.GetByIdAsync(
                dto.ClassId,
                null))
            .ReturnsAsync(classEntity);

        _mapperMock
            .Setup(x => x.Map<Assignment>(dto))
            .Returns(assignment);

        await _assignmentService.AddAssignment(
            teacherId,
            dto);

        assignment.TeacherId
            .Should()
            .Be(teacherId);

        assignment.CreatedAt
            .Should()
            .BeCloseTo(
                DateTime.UtcNow,
                TimeSpan.FromSeconds(5));

        _assignmentRepositoryMock.Verify(
            x => x.AddAsync(
                It.Is<Assignment>(a =>
                    a.TeacherId == teacherId &&
                    a.SubjectId == dto.SubjectId &&
                    a.ClassId == dto.ClassId)),
            Times.Once);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Once);
    }

    [Test]
    public async Task DeleteAssignment_ShouldDeleteAssignment_WhenAssignmentExists()
    {
        var assignmentId = 1;
        var teacherId = 10;

        var assignment = new Assignment
        {
            Id = assignmentId,
            TeacherId = teacherId
        };

        _assignmentRepositoryMock
            .Setup(x =>
                x.GetAssignmentByIdAndTeacherIdAsync(
                    assignmentId,
                    teacherId))
            .ReturnsAsync(assignment);

        await _assignmentService.DeleteAssignment(
            assignmentId,
            teacherId);

        _assignmentRepositoryMock.Verify(
            x =>
                x.GetAssignmentByIdAndTeacherIdAsync(
                    assignmentId,
                    teacherId),
            Times.Once);

        _assignmentRepositoryMock.Verify(
            x => x.Delete(assignment),
            Times.Once);

        _unitOfWorkMock.Verify(
            x => x.CommitAsync(),
            Times.Once);
    }

    [Test]
    public async Task GetAllAssignments_ShouldReturnTeacherAssignments()
    {
        var teacherId = 10;

        var assignments = new List<Assignment>
        {
            new Assignment
            {
                Id = 1,
                TeacherId = teacherId
            },
            new Assignment
            {
                Id = 2,
                TeacherId = teacherId
            }
        };

        var expectedResult = new List<AssignmentResponseDto>
        {
            new AssignmentResponseDto(),
            new AssignmentResponseDto()
        };

        _assignmentRepositoryMock
            .Setup(x =>
                x.GetAllAssignmentsByTeacherIdAsync(teacherId))
            .ReturnsAsync(assignments);

        _mapperMock
            .Setup(x =>
                x.Map<IEnumerable<AssignmentResponseDto>>(assignments))
            .Returns(expectedResult);

        var result =
            await _assignmentService.GetAllAssignments(
                teacherId);

        result
            .Should()
            .NotBeNull();

        result
            .Should()
            .HaveCount(2);

        _assignmentRepositoryMock.Verify(
            x =>
                x.GetAllAssignmentsByTeacherIdAsync(
                    teacherId),
            Times.Once);

        _mapperMock.Verify(
            x =>
                x.Map<IEnumerable<AssignmentResponseDto>>(
                    assignments),
            Times.Once);
    }

    [Test]
    public async Task GetAssignmentById_ShouldReturnAssignment()
    {
        var assignmentId = 1;
        var teacherId = 10;

        var assignment = new Assignment
        {
            Id = assignmentId,
            TeacherId = teacherId
        };

        var expectedResult =
            new AssignmentResponseDto();

        _assignmentRepositoryMock
            .Setup(x =>
                x.GetAssignmentByIdAndTeacherIdAsync(
                    assignmentId,
                    teacherId))
            .ReturnsAsync(assignment);

        _mapperMock
            .Setup(x =>
                x.Map<AssignmentResponseDto>(
                    assignment))
            .Returns(expectedResult);

        var result =
            await _assignmentService.GetAssignmentById(
                assignmentId,
                teacherId);

        result
            .Should()
            .NotBeNull();

        result
            .Should()
            .Be(expectedResult);

        _assignmentRepositoryMock.Verify(
            x =>
                x.GetAssignmentByIdAndTeacherIdAsync(
                    assignmentId,
                    teacherId),
            Times.Once);

        _mapperMock.Verify(
            x =>
                x.Map<AssignmentResponseDto>(
                    assignment),
            Times.Once);
    }

    [Test]
    public async Task GetMyAssignments_ShouldThrowException_WhenStudentIsNotAssignedToClass()
    {
        var studentId = 5;

        _studentClassRepositoryMock
            .Setup(x =>
                x.GetByStudentIdAsync(studentId))
            .ReturnsAsync((StudentClass?)null);

        Func<Task> action = async () =>
            await _assignmentService.GetMyAssignments(
                studentId);

        await action
            .Should()
            .ThrowAsync<Exception>()
            .WithMessage(
                "Student is not assigned to any class.");

        _assignmentRepositoryMock.Verify(
            x =>
                x.GetAllAssignmentsByClassIdAsync(
                    It.IsAny<int>()),
            Times.Never);
    }

    [Test]
    public async Task GetMyAssignments_ShouldReturnAssignments_WhenStudentHasClass()
    {
        var studentId = 5;
        var classId = 2;

        var studentClass = new StudentClass
        {
            StudentId = studentId,
            ClassId = classId
        };

        var assignments = new List<Assignment>
        {
            new Assignment
            {
                Id = 1,
                ClassId = classId
            },
            new Assignment
            {
                Id = 2,
                ClassId = classId
            }
        };

        var expectedResult =
            new List<AssignmentResponseDto>
            {
                new AssignmentResponseDto(),
                new AssignmentResponseDto()
            };

        _studentClassRepositoryMock
            .Setup(x =>
                x.GetByStudentIdAsync(studentId))
            .ReturnsAsync(studentClass);

        _assignmentRepositoryMock
            .Setup(x =>
                x.GetAllAssignmentsByClassIdAsync(classId))
            .ReturnsAsync(assignments);

        _mapperMock
            .Setup(x =>
                x.Map<IEnumerable<AssignmentResponseDto>>(
                    assignments))
            .Returns(expectedResult);

        var result =
            await _assignmentService.GetMyAssignments(
                studentId);

        result
            .Should()
            .NotBeNull();

        result
            .Should()
            .HaveCount(2);

        _studentClassRepositoryMock.Verify(
            x =>
                x.GetByStudentIdAsync(studentId),
            Times.Once);

        _assignmentRepositoryMock.Verify(
            x =>
                x.GetAllAssignmentsByClassIdAsync(
                    classId),
            Times.Once);

        _mapperMock.Verify(
            x =>
                x.Map<IEnumerable<AssignmentResponseDto>>(
                    assignments),
            Times.Once);
    }

    [Test]
    public async Task UpdateAssignment_ShouldUpdateAssignment()
    {
        var assignmentId = 1;
        var teacherId = 10;

        var dto = new CreateAssignmentDto
        {
            SubjectId = 2,
            ClassId = 3
        };

        var assignment = new Assignment
        {
            Id = assignmentId,
            TeacherId = teacherId
        };

        _assignmentRepositoryMock
            .Setup(x =>
                x.GetAssignmentByIdAndTeacherIdAsync(
                    assignmentId,
                    teacherId))
            .ReturnsAsync(assignment);

        await _assignmentService.UpdateAssignment(
            assignmentId,
            teacherId,
            dto);

        _assignmentRepositoryMock.Verify(
            x =>
                x.GetAssignmentByIdAndTeacherIdAsync(
                    assignmentId,
                    teacherId),
            Times.Once);

        _mapperMock.Verify(
            x =>
                x.Map(dto, assignment),
            Times.Once);

        _unitOfWorkMock.Verify(
            x =>
                x.CommitAsync(),
            Times.Once);
    }
}