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
    public class TeacherSubjectServiceTests
    {
        private Mock<ITeacherSubjectRepository> _teacherSubjectRepositoryMock = null!;
        private Mock<IUnitOfWork> _unitOfWorkMock = null!;
        private Mock<IMapper> _mapperMock = null!;

        private TeacherSubjectService _teacherSubjectService = null!;

        [SetUp]
        public void Setup()
        {
            _teacherSubjectRepositoryMock = new Mock<ITeacherSubjectRepository>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _mapperMock = new Mock<IMapper>();

            _teacherSubjectService = new TeacherSubjectService(
                _teacherSubjectRepositoryMock.Object,
                _unitOfWorkMock.Object,
                _mapperMock.Object
            );
        }

        [Test]
        public async Task AddTeacherToSubject_ShouldAddTeacherSubject()
        {
            var dto = new AssignTeacherSubjectDto();

            var teacherSubject = new TeacherSubject
            {
                Id = 1
            };

            _mapperMock
                .Setup(x => x.Map<TeacherSubject>(dto))
                .Returns(teacherSubject);

            await _teacherSubjectService.AddTeacherToSubject(dto);

            _mapperMock.Verify(
                x => x.Map<TeacherSubject>(dto),
                Times.Once);

            _teacherSubjectRepositoryMock.Verify(
                x => x.AddAsync(teacherSubject),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task DeleteTeacher_ShouldDelete_WhenTeacherSubjectExists()
        {
            var id = 1;

            var teacherSubject = new TeacherSubject
            {
                Id = id
            };

            _teacherSubjectRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync(teacherSubject);

            await _teacherSubjectService.DeleteTeacher(id);

            _teacherSubjectRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _teacherSubjectRepositoryMock.Verify(
                x => x.Delete(teacherSubject),
                Times.Once);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Once);
        }

        [Test]
        public async Task DeleteTeacher_ShouldNotDelete_WhenTeacherSubjectDoesNotExist()
        {
            var id = 1;

            _teacherSubjectRepositoryMock
                .Setup(x => x.GetByIdAsync(id, null))
                .ReturnsAsync((TeacherSubject?)null);

            await _teacherSubjectService.DeleteTeacher(id);

            _teacherSubjectRepositoryMock.Verify(
                x => x.GetByIdAsync(id, null),
                Times.Once);

            _teacherSubjectRepositoryMock.Verify(
                x => x.Delete(
                    It.IsAny<TeacherSubject>()),
                Times.Never);

            _unitOfWorkMock.Verify(
                x => x.CommitAsync(),
                Times.Never);
        }

        [Test]
        public async Task GetSubjectsByTeacherId_ShouldReturnSubjects()
        {
            var teacherId = 1;

            var teacherSubjects = new List<TeacherSubject>
            {
                new TeacherSubject
                {
                    Id = 1,
                    TeacherId = teacherId
                },
                new TeacherSubject
                {
                    Id = 2,
                    TeacherId = teacherId
                }
            };

            var expectedResult =
                new List<TeacherSubjectResponseDto>
                {
                    new TeacherSubjectResponseDto(),
                    new TeacherSubjectResponseDto()
                };

            _teacherSubjectRepositoryMock
                .Setup(x => x.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<TeacherSubject, bool>>>(),
                    It.IsAny<System.Func<
                        IQueryable<TeacherSubject>,
                        IQueryable<TeacherSubject>>>(),
                    true))
                .ReturnsAsync(teacherSubjects);

            _mapperMock
                .Setup(x =>
                    x.Map<IEnumerable<TeacherSubjectResponseDto>>(
                        teacherSubjects))
                .Returns(expectedResult);

            var result =
                await _teacherSubjectService.GetSubjectsByTeacherId(
                    teacherId);

            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            _teacherSubjectRepositoryMock.Verify(
                x => x.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<TeacherSubject, bool>>>(),
                    It.IsAny<System.Func<
                        IQueryable<TeacherSubject>,
                        IQueryable<TeacherSubject>>>(),
                    true),
                Times.Once);

            _mapperMock.Verify(
                x =>
                    x.Map<IEnumerable<TeacherSubjectResponseDto>>(
                        teacherSubjects),
                Times.Once);
        }

        [Test]
        public async Task GetSubjectsByTeacherId_ShouldReturnEmpty_WhenNoSubjectsFound()
        {
            var teacherId = 1;

            var teacherSubjects =
                new List<TeacherSubject>();

            var expectedResult =
                new List<TeacherSubjectResponseDto>();

            _teacherSubjectRepositoryMock
                .Setup(x => x.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<TeacherSubject, bool>>>(),
                    It.IsAny<System.Func<
                        IQueryable<TeacherSubject>,
                        IQueryable<TeacherSubject>>>(),
                    true))
                .ReturnsAsync(teacherSubjects);

            _mapperMock
                .Setup(x =>
                    x.Map<IEnumerable<TeacherSubjectResponseDto>>(
                        teacherSubjects))
                .Returns(expectedResult);

            var result =
                await _teacherSubjectService.GetSubjectsByTeacherId(
                    teacherId);

            result.Should().NotBeNull();
            result.Should().BeEmpty();

            _mapperMock.Verify(
                x =>
                    x.Map<IEnumerable<TeacherSubjectResponseDto>>(
                        teacherSubjects),
                Times.Once);
        }
    }
}