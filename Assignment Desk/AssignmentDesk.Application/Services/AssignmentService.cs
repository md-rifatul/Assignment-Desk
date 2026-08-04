using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Domain.Entities;
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
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public AssignmentService(IAssignmentRepository createAssignmentRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _createAssignmentRepository = createAssignmentRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddAssignment(int teacherId, CreateAssignmentDto dto)
        {
            var assignment = _mapper.Map<Assignment>(dto);
            assignment.TeacherId = teacherId;
            assignment.CreatedAt = DateTime.UtcNow;

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

        public async Task UpdateAssignment(int id, int teacherId, CreateAssignmentDto dto)
        {
            var assignment = await _createAssignmentRepository.GetAssignmentByIdAndTeacherIdAsync(id, teacherId);
            _mapper.Map(dto, assignment);
            await _unitOfWork.CommitAsync();
        }
    }
}
