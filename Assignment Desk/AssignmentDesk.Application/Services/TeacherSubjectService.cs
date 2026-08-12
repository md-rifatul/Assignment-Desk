using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Domain.Entities;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Services
{
    public class TeacherSubjectService : ITeacherSubjectService
    {
        private readonly ITeacherSubjectRepository _teacherSubjectRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public TeacherSubjectService(ITeacherSubjectRepository teacherSubjectRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _teacherSubjectRepository = teacherSubjectRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddTeacherToSubject(AssignTeacherSubjectDto dto)
        {
            await _teacherSubjectRepository.AddAsync(_mapper.Map<TeacherSubject>(dto));
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteTeacher(int id)
        {
            var teacherSubject = await _teacherSubjectRepository.GetByIdAsync(id);
            if (teacherSubject == null)
                return;
            _teacherSubjectRepository.Delete(teacherSubject);
            await _unitOfWork.CommitAsync();
        }

        public async Task<IEnumerable<TeacherSubjectResponseDto>> GetSubjectsByTeacherId(int id)
        {
            var subjects = await _teacherSubjectRepository.GetAllAsync(filter: p => p.TeacherId == id, include: x=>x.Include(t=>t.Subject));
            return _mapper.Map<IEnumerable<TeacherSubjectResponseDto>>(subjects);
        }
    }
}
