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
    public class SubjectService : ISubjectService
    {
        public readonly ISubjectRepository _subjectRepository;
        public readonly IUnitOfWork _unitOfWork;
        public readonly IMapper _mapper;
        public SubjectService(ISubjectRepository subjectRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _subjectRepository = subjectRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddSubject(CreateSubjectDto dto)
        {
            if(dto == null) throw new ArgumentNullException(nameof(dto));
            await _subjectRepository.AddAsync(_mapper.Map<Subject>(dto));
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteSubject(int id)
        {
            var subject = await _subjectRepository.GetByIdAsync(id);
            if(subject!=null)
                _subjectRepository.Delete(subject);
            await _unitOfWork.CommitAsync();
        }

        public async Task<SubjectResponseDto> GetSubjectById(int id)
        {
            var subject = await _subjectRepository.GetByIdAsync(id);
            return _mapper.Map<SubjectResponseDto>(subject);
        }

        public async Task<IEnumerable<SubjectResponseDto>> GetSubjects()
        {
            var subjects = await _subjectRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<SubjectResponseDto>>(subjects);
        }

        public async Task UpdateSubject(int id, CreateSubjectDto dto)
        {
            var subject = await _subjectRepository.GetByIdAsync(id);
            _mapper.Map(subject, dto);
            await _unitOfWork.CommitAsync();
        }
    }
}
