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
    public class SubjectServiceTests
    {
        private Mock<ISubjectRepository> _subjectRepositoryMock = null!;
        private Mock<IUnitOfWork> _unitOfWorkMock = null!;
        private Mock<IMapper> _mapperMock = null!;

        private SubjectService _subjectService = null!;

        [SetUp]
        public void Setup()
        {
            _subjectRepositoryMock = new Mock<ISubjectRepository>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _mapperMock = new Mock<IMapper>();

            _subjectService = new SubjectService(
                _subjectRepositoryMock.Object,
                _unitOfWorkMock.Object,
                _mapperMock.Object
            );
        }

        [Test]
        public async Task AddSubject_ShouldThrowException_WhenDtoIsNull()
        {
            CreateSubjectDto dto = null!;

            Func<Task> action = async () =>
                await _subjectService.AddSubject(dto);

            await action
                .Should()
                .ThrowAsync<ArgumentNullException>();

            _mapperMock.Verify(
                x => x.Map<Subject>(
                    It.IsAny<CreateSubjectDto>()),
                Times.Never);

            _subjectRepositoryMock.Verify(
                x => x.AddAsync(
                    It.IsAny<Subject>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task AddSubject_ShouldAddSubject_WhenDtoIsValid()
        {
            var dto = new CreateSubjectDto();

            var subject = new Subject
            {
                Id = 1
            };

            _mapperMock
                .Setup(x => x.Map<Subject>(dto))
                .Returns(subject);

            await _subjectService.AddSubject(dto);

            _mapperMock.Verify(
                x => x.Map<Subject>(dto),
                Times.Once);

            _subjectRepositoryMock.Verify(
                x => x.AddAsync(subject),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task DeleteSubject_ShouldDelete_WhenSubjectExists()
        {
            var id = 1;

            var subject = new Subject
            {
                Id = id
            };

            _subjectRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(subject);

            await _subjectService.DeleteSubject(id);

            _subjectRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _subjectRepositoryMock.Verify(
                x => x.Delete(subject),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task DeleteSubject_ShouldNotDelete_WhenSubjectDoesNotExist()
        {
            var id = 1;

            _subjectRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((Subject?)null);

            await _subjectService.DeleteSubject(id);

            _subjectRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _subjectRepositoryMock.Verify(
                x => x.Delete(
                    It.IsAny<Subject>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task GetSubjectById_ShouldReturnSubject_WhenSubjectExists()
        {
            var id = 1;

            var subject = new Subject
            {
                Id = id
            };

            var expectedResult = new SubjectResponseDto();

            _subjectRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(subject);

            _mapperMock
                .Setup(x => x.Map<SubjectResponseDto>(subject))
                .Returns(expectedResult);

            var result =
                await _subjectService.GetSubjectById(id);

            result.Should().NotBeNull();
            result.Should().Be(expectedResult);

            _subjectRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map<SubjectResponseDto>(subject),
                Times.Once);
        }

        [Test]
        public async Task GetSubjectById_ShouldReturnNull_WhenSubjectDoesNotExist()
        {
            var id = 1;

            _subjectRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((Subject?)null);

            _mapperMock
                .Setup(x => x.Map<SubjectResponseDto>(
                    It.IsAny<Subject>()))
                .Returns((SubjectResponseDto?)null);

            var result =
                await _subjectService.GetSubjectById(id);

            result.Should().BeNull();

            _subjectRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);
        }

        [Test]
        public async Task GetSubjects_ShouldReturnAllSubjects()
        {
            var subjects = new List<Subject>
            {
                new Subject
                {
                    Id = 1
                },
                new Subject
                {
                    Id = 2
                }
            };

            var expectedResult = new List<SubjectResponseDto>
            {
                new SubjectResponseDto(),
                new SubjectResponseDto()
            };

            _subjectRepositoryMock
                .Setup(x => x.GetAllAsync(
                    null,
                    null,
                    true))
                .ReturnsAsync(subjects);

            _mapperMock
                .Setup(x =>
                    x.Map<IEnumerable<SubjectResponseDto>>(
                        subjects))
                .Returns(expectedResult);

            var result =
                await _subjectService.GetSubjects();

            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            _subjectRepositoryMock.Verify(
                x => x.GetAllAsync(
                    null,
                    null,
                    true),
                Times.Once);

            _mapperMock.Verify(
                x =>
                    x.Map<IEnumerable<SubjectResponseDto>>(
                        subjects),
                Times.Once);
        }

        [Test]
        public async Task UpdateSubject_ShouldUpdate_WhenSubjectExists()
        {
            var id = 1;

            var dto = new CreateSubjectDto();

            var subject = new Subject
            {
                Id = id
            };

            _subjectRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(subject);

            await _subjectService.UpdateSubject(id, dto);

            _subjectRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _mapperMock.Verify(
                x => x.Map(
                    dto,
                    subject),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task UpdateSubject_ShouldNotUpdate_WhenSubjectDoesNotExist()
        {
            var id = 1;

            var dto = new CreateSubjectDto();

            _subjectRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((Subject?)null);

            await _subjectService.UpdateSubject(id, dto);

            _mapperMock.Verify(
                x => x.Map(
                    dto,
                    It.IsAny<Subject>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }
    }
}