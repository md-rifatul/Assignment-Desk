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
    public class StudentClassService : IStudentClassService
    {
        private readonly IStudentClassRepository _studentClassRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public StudentClassService(IStudentClassRepository studentClassRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _studentClassRepository = studentClassRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddStudentClass(CreateStudentClassDto dto)
        {
            bool isStudentExistOrNot = await _studentClassRepository.ExistsAsync(s=>s.StudentId == dto.StudentId);
            if (isStudentExistOrNot)
            {
                throw new InvalidOperationException("This student is already added in a class");
            }
            await _studentClassRepository.AddAsync(_mapper.Map<StudentClass>(dto));
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteStudentClass(int id)
        {
            var student = await _studentClassRepository.GetByIdAsync(id);
            if(student != null)
                _studentClassRepository.Delete(student);
            await _unitOfWork.CommitAsync();
        }

        public async Task<StudentClassResponseDto> GetStudentClassById(int id)
        {
            var sutdent = await _studentClassRepository.GetByIdAsync(id, include: q => q.Include(c => c.Class).Include(c=>c.Student));
            if(sutdent != null)
                return _mapper.Map<StudentClassResponseDto>(sutdent);
            throw new ArgumentNullException();
        }

        public async Task UpdateStudentClass(int id, CreateStudentClassDto dto)
        {
            var student = await _studentClassRepository.GetByIdAsync(id);
            if( student != null)
                _mapper.Map(dto, student);
            await _unitOfWork.CommitAsync();
        }

        public async Task<IEnumerable<StudentClassResponseDto>> GetAllStudentClasses()
        {
            var studentClasses = await _studentClassRepository.GetAllAsync(include: q => q.Include(c => c.Class).Include(c => c.Student));
            return _mapper.Map<IEnumerable<StudentClassResponseDto>>(studentClasses);
        }
    }
}
