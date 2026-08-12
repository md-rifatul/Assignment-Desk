using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Application.Services;
using AssignmentDesk.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using NUnit.Framework;

namespace AssignmentDesk.Tests.Services
{
    [TestFixture]
    public class ClassServiceTests
    {
        private Mock<IClassRepository> _classRepositoryMock = null!;
        private Mock<IUnitOfWork> _unitOfWorkMock = null!;
        private Mock<IMapper> _mapperMock = null!;

        private ClassService _classService = null!;

        [SetUp]
        public void Setup()
        {
            _classRepositoryMock = new Mock<IClassRepository>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _mapperMock = new Mock<IMapper>();

            _classService = new ClassService(
                _classRepositoryMock.Object,
                _unitOfWorkMock.Object,
                _mapperMock.Object
            );
        }

        [Test]
        public async Task CreateClass_ShouldNotDoAnything_WhenDtoIsNull()
        {
            CreateClassDto dto = null!;

            await _classService.CreateClass(dto);

            _mapperMock.Verify(
                x => x.Map<Class>(
                    It.IsAny<CreateClassDto>()),
                Times.Never);

            _classRepositoryMock.Verify(
                x => x.AddAsync(
                    It.IsAny<Class>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task CreateClass_ShouldCreateClass_WhenDtoIsValid()
        {
            var dto = new CreateClassDto();

            var classEntity = new Class
            {
                Id = 1
            };

            _mapperMock
                .Setup(x => x.Map<Class>(dto))
                .Returns(classEntity);

            await _classService.CreateClass(dto);

            _mapperMock.Verify(
                x => x.Map<Class>(dto),
                Times.Once);

            _classRepositoryMock.Verify(
                x => x.AddAsync(classEntity),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task DeleteClass_ShouldNotDelete_WhenClassDoesNotExist()
        {
            var id = 1;

            _classRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((Class?)null);

            await _classService.DeleteClass(id);

            _classRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _classRepositoryMock.Verify(
                x => x.Delete(
                    It.IsAny<Class>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task DeleteClass_ShouldDelete_WhenClassExists()
        {
            var id = 1;

            var classEntity = new Class
            {
                Id = id
            };

            _classRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(classEntity);

            await _classService.DeleteClass(id);

            _classRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _classRepositoryMock.Verify(
                x => x.Delete(classEntity),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task GetAllClasses_ShouldReturnMappedClasses()
        {
            var classes = new List<Class>
            {
                new Class
                {
                    Id = 1
                },
                new Class
                {
                    Id = 2
                }
            };

            var expectedResult = new List<ClassResponseDto>
            {
                new ClassResponseDto(),
                new ClassResponseDto()
            };

            _classRepositoryMock
                .Setup(x => x.GetAllAsync(
                    null,
                    null,
                    true))
                .ReturnsAsync(classes);

            _mapperMock
                .Setup(x =>
                    x.Map<IEnumerable<ClassResponseDto>>(
                        classes))
                .Returns(expectedResult);

            var result =
                await _classService.GetAllClasses();

            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            _classRepositoryMock.Verify(
                x => x.GetAllAsync(
                    null,
                    null,
                    true),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<IEnumerable<ClassResponseDto>>(
                    classes),
                Times.Once);
        }

        [Test]
        public async Task GetClassById_ShouldReturnMappedClass_WhenClassExists()
        {
            var id = 1;

            var classEntity = new Class
            {
                Id = id
            };

            var expectedResult = new ClassResponseDto();

            _classRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(classEntity);

            _mapperMock
                .Setup(x =>
                    x.Map<ClassResponseDto>(
                        classEntity))
                .Returns(expectedResult);

            var result =
                await _classService.GetClassById(id);

            result.Should().NotBeNull();
            result.Should().Be(expectedResult);

            _classRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<ClassResponseDto>(
                    classEntity),
                Times.Once);
        }

        [Test]
        public async Task GetClassById_ShouldReturnNull_WhenClassDoesNotExist()
        {
            var id = 1;

            _classRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((Class?)null);

            _mapperMock
                .Setup(x =>
                    x.Map<ClassResponseDto>(
                        null))
                .Returns((ClassResponseDto?)null);

            var result =
                await _classService.GetClassById(id);

            result.Should().BeNull();

            _classRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<ClassResponseDto>(
                    null),
                Times.Once);
        }

        [Test]
        public async Task UpdateClass_ShouldNotUpdate_WhenClassDoesNotExist()
        {
            var id = 1;

            var dto = new CreateClassDto();

            _classRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((Class?)null);

            await _classService.UpdateClass(id, dto);

            _mapperMock.Verify(
                x => x.Map(
                    dto,
                    It.IsAny<Class>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task UpdateClass_ShouldUpdate_WhenClassExists()
        {
            var id = 1;

            var dto = new CreateClassDto();

            var classEntity = new Class
            {
                Id = id
            };

            _classRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(classEntity);

            await _classService.UpdateClass(id, dto);

            _classRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map(
                    dto,
                    classEntity),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }
    }
}