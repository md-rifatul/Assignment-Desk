using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Domain.Entities;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Services
{
    public class ClassService : IClassService
    {
        private readonly IClassRepository _classRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public ClassService(IClassRepository classRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _classRepository = classRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task CreateClass(CreateClassDto dto)
        {
            if(dto == null) return;
            await _classRepository.AddAsync(_mapper.Map<Class>(dto));
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteClass(int id)
        {
            var cls = await _classRepository.GetByIdAsync(id);
            if(cls == null) return;
            _classRepository.Delete(cls);
            await _unitOfWork.CommitAsync();
        }

        public async Task<IEnumerable<ClassResponseDto>> GetAllClasses()
        {
            var classes = await _classRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<ClassResponseDto>>(classes);
        }

        public async Task<ClassResponseDto> GetClassById(int id)
        {
            var cls = await _classRepository.GetByIdAsync(id);
            return _mapper.Map<ClassResponseDto>(cls);
        }

        public async Task UpdateClass(int id, CreateClassDto dto)
        {
            var cls = await _classRepository.GetByIdAsync(id);
            if(cls == null) return;
            _mapper.Map(dto, cls);
            await _unitOfWork.CommitAsync();
        }
    }
}
