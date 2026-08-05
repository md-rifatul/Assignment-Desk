using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly IAssignmentRepository _createAssignmentRepository;
        private readonly ISubjectRepository _subjectRepository;
        private readonly IClassRepository _classRepository;
        private readonly IStudentClassRepository _studentClassRepository;
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public AssignmentService(IAssignmentRepository createAssignmentRepository,ISubjectRepository subjectRepository,IClassRepository classRepository,IStudentClassRepository studentClassRepository, IAssignmentRepository assignmentRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _createAssignmentRepository = createAssignmentRepository;
            _subjectRepository = subjectRepository;
            _classRepository = classRepository;
            _studentClassRepository = studentClassRepository;
            _assignmentRepository = assignmentRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddAssignment(int teacherId, CreateAssignmentDto dto)
        {
            var subject = await _subjectRepository.GetByIdAsync(dto.SubjectId);

            if (subject == null)
                throw new Exception("Subject not found.");

            // Class আছে কিনা
            var classEntity = await _classRepository.GetByIdAsync(dto.ClassId);

            if (classEntity == null)
                throw new Exception("Class not found.");

            // Subject ওই Class-এর কিনা
            if (subject.ClassId != dto.ClassId)
                throw new Exception("Selected subject does not belong to the selected class.");

            // Assignment Create
            var assignment = _mapper.Map<Assignment>(dto);

            assignment.TeacherId = teacherId;
            assignment.CreatedAt = DateTime.UtcNow;
            assignment.Status = AssignmentStatus.Publish;

            await _createAssignmentRepository.AddAsync(assignment);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteAssignment(int id, int teacherId)
        {
            var assignment = await _createAssignmentRepository.GetAssignmentByIdAndTeacherIdAsync(id, teacherId);
            _createAssignmentRepository.Delete(assignment);
            await _unitOfWork.CommitAsync();
        }

        public async Task<IEnumerable<AssignmentResponseDto>> GetAllAssignments(int teacherId)
        {
            var assignments = await _createAssignmentRepository.GetAllAssignmentsByTeacherIdAsync(teacherId);
            return _mapper.Map<IEnumerable<AssignmentResponseDto>>(assignments);
        }

        public async Task<AssignmentResponseDto> GetAssignmentById(int id, int teacherId)
        {
            var assignment = await _createAssignmentRepository.GetAssignmentByIdAndTeacherIdAsync(id, teacherId);
            return _mapper.Map<AssignmentResponseDto>(assignment);
        }

        public async Task<IEnumerable<AssignmentResponseDto>> GetMyAssignments(int studentId)
        {
            var studentClass = await _studentClassRepository.GetByStudentIdAsync(studentId);

            if (studentClass == null)
                throw new Exception("Student is not assigned to any class.");

            var assignments = await _assignmentRepository
                .GetAllAssignmentsByClassIdAsync(studentClass.ClassId);

            return _mapper.Map<IEnumerable<AssignmentResponseDto>>(assignments);
        }

        public async Task UpdateAssignment(int id, int teacherId, CreateAssignmentDto dto)
        {
            var assignment = await _createAssignmentRepository.GetAssignmentByIdAndTeacherIdAsync(id, teacherId);
            _mapper.Map(dto, assignment);
            await _unitOfWork.CommitAsync();
        }
    }
}
