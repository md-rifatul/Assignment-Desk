using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IAuth;
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
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public AdminService(IUserRepository userRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task Create(RegisterDto dto)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);

            if (existingUser != null)
                throw new Exception("Email already exists.");

            var user = _mapper.Map<User>(dto);

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            user.IsActive = true;
            user.CreatedAt = DateTime.UtcNow;

            await _userRepository.AddAsync(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task Delete(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            await _userRepository.DeleteAsync(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task<UserResponseDto> GetById(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return _mapper.Map<UserResponseDto>(user);

        }

        public async Task<IEnumerable<UserResponseDto>> GetUsers()
        {
            var users = await _userRepository.GetUsers();

            var ma=  _mapper.Map<IEnumerable<UserResponseDto>>(users);
            return ma;
        }

        public Task<IEnumerable<UserResponseDto>> SearchAsync(string term)
        {
            throw new NotImplementedException();
        }

        public async Task Update(int id, RegisterDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            _mapper.Map(dto, user);
            await _unitOfWork.CommitAsync();
        }
    }
}
