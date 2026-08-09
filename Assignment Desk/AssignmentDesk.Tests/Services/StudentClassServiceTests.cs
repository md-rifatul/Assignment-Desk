using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Application.Services;
using AssignmentDesk.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using NUnit.Framework;
using System.Linq.Expressions;

namespace AssignmentDesk.Tests.Services
{
    [TestFixture]
    public class StudentClassServiceTests
    {
        private Mock<IStudentClassRepository> _studentClassRepositoryMock = null!;
        private Mock<IUnitOfWork> _unitOfWorkMock = null!;
        private Mock<IMapper> _mapperMock = null!;

        private StudentClassService _studentClassService = null!;

        [SetUp]
        public void Setup()
        {
            _studentClassRepositoryMock =
                new Mock<IStudentClassRepository>();

            _unitOfWorkMock =
                new Mock<IUnitOfWork>();

            _mapperMock =
                new Mock<IMapper>();

            _studentClassService =
                new StudentClassService(
                    _studentClassRepositoryMock.Object,
                    _unitOfWorkMock.Object,
                    _mapperMock.Object
                );
        }

        [Test]
        public async Task AddStudentClass_ShouldThrowException_WhenStudentAlreadyExists()
        {
            var dto = new CreateStudentClassDto
            {
                StudentId = 1,
                ClassId = 2
            };

            _studentClassRepositoryMock
                .Setup(x => x.ExistsAsync(
                    It.IsAny<Expression<Func<StudentClass, bool>>>()))
                .ReturnsAsync(true);

            Func<Task> action = async () =>
                await _studentClassService.AddStudentClass(dto);

            await action
                .Should()
                .ThrowAsync<InvalidOperationException>()
                .WithMessage(
                    "This student is already added in a class");

            _mapperMock.Verify(
                x => x.Map<StudentClass>(
                    It.IsAny<CreateStudentClassDto>()),
                Times.Never);

            _studentClassRepositoryMock.Verify(
                x => x.AddAsync(
                    It.IsAny<StudentClass>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task AddStudentClass_ShouldAddStudentClass_WhenStudentDoesNotExist()
        {
            var dto = new CreateStudentClassDto
            {
                StudentId = 1,
                ClassId = 2
            };

            var studentClass = new StudentClass
            {
                Id = 1,
                StudentId = dto.StudentId,
                ClassId = dto.ClassId
            };

            _studentClassRepositoryMock
                .Setup(x => x.ExistsAsync(
                    It.IsAny<Expression<Func<StudentClass, bool>>>()))
                .ReturnsAsync(false);

            _mapperMock
                .Setup(x => x.Map<StudentClass>(dto))
                .Returns(studentClass);

            await _studentClassService.AddStudentClass(dto);

            _studentClassRepositoryMock.Verify(
                x => x.ExistsAsync(
                    It.IsAny<Expression<Func<StudentClass, bool>>>()),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<StudentClass>(dto),
                Times.Once);

            _studentClassRepositoryMock.Verify(
                x => x.AddAsync(studentClass),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task DeleteStudentClass_ShouldDelete_WhenStudentClassExists()
        {
            var id = 1;

            var studentClass = new StudentClass
            {
                Id = id,
                StudentId = 5,
                ClassId = 2
            };

            _studentClassRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(studentClass);

            await _studentClassService.DeleteStudentClass(id);

            _studentClassRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _studentClassRepositoryMock.Verify(
                x => x.Delete(studentClass),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task DeleteStudentClass_ShouldNotDelete_WhenStudentClassDoesNotExist()
        {
            var id = 1;

            _studentClassRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((StudentClass?)null);

            await _studentClassService.DeleteStudentClass(id);

            _studentClassRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _studentClassRepositoryMock.Verify(
                x => x.Delete(
                    It.IsAny<StudentClass>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task GetStudentClassById_ShouldReturnMappedDto_WhenStudentClassExists()
        {
            var id = 1;

            var studentClass = new StudentClass
            {
                Id = id,
                StudentId = 5,
                ClassId = 2
            };

            var expectedResult =
                new StudentClassResponseDto();

            _studentClassRepositoryMock
                .Setup(x => x.GetByIdAsync(
                    id,
                    It.IsAny<Func<IQueryable<StudentClass>,
                        IQueryable<StudentClass>>?>()))
                .ReturnsAsync(studentClass);

            _mapperMock
                .Setup(x =>
                    x.Map<StudentClassResponseDto>(
                        studentClass))
                .Returns(expectedResult);

            var result =
                await _studentClassService
                    .GetStudentClassById(id);

            result.Should().NotBeNull();
            result.Should().Be(expectedResult);

            _studentClassRepositoryMock.Verify(
                x => x.GetByIdAsync(
                    id,
                    It.IsAny<Func<IQueryable<StudentClass>,
                        IQueryable<StudentClass>>?>()),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<StudentClassResponseDto>(
                    studentClass),
                Times.Once);
        }

        [Test]
        public async Task GetStudentClassById_ShouldThrowException_WhenStudentClassDoesNotExist()
        {
            var id = 1;

            _studentClassRepositoryMock
                .Setup(x => x.GetByIdAsync(
                    id,
                    It.IsAny<Func<IQueryable<StudentClass>,
                        IQueryable<StudentClass>>?>()))
                .ReturnsAsync((StudentClass?)null);

            Func<Task> action = async () =>
                await _studentClassService
                    .GetStudentClassById(id);

            await action
                .Should()
                .ThrowAsync<ArgumentNullException>();

            _mapperMock.Verify(
                x => x.Map<StudentClassResponseDto>(
                    It.IsAny<StudentClass>()),
                Times.Never);
        }

        [Test]
        public async Task UpdateStudentClass_ShouldUpdate_WhenStudentClassExists()
        {
            var id = 1;

            var dto = new CreateStudentClassDto
            {
                StudentId = 10,
                ClassId = 3
            };

            var studentClass = new StudentClass
            {
                Id = id,
                StudentId = 5,
                ClassId = 2
            };

            _studentClassRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(studentClass);

            await _studentClassService
                .UpdateStudentClass(id, dto);

            _studentClassRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map(
                    dto,
                    studentClass),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task UpdateStudentClass_ShouldOnlyCommit_WhenStudentClassDoesNotExist()
        {
            var id = 1;

            var dto = new CreateStudentClassDto
            {
                StudentId = 10,
                ClassId = 3
            };

            _studentClassRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((StudentClass?)null);

            await _studentClassService
                .UpdateStudentClass(id, dto);

            _mapperMock.Verify(
                x => x.Map(
                    dto,
                    It.IsAny<StudentClass>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }
    }
}