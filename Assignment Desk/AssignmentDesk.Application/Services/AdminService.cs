using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Domain.Entities;
using AutoMapper;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;


namespace AssignmentDesk.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        public AdminService(IUserRepository userRepository, IUnitOfWork unitOfWork, IMapper mapper, IEmailService emailService, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task Create(RegisterDto dto)
        {
            var existingUser =
                await _userRepository.GetByEmailAsync(dto.Email);

            if (existingUser != null)
                throw new Exception("Email already exists.");

            var user = _mapper.Map<User>(dto);

            // Generate activation token
            var tokenBytes =
                RandomNumberGenerator.GetBytes(32);

            var token =
                WebEncoders.Base64UrlEncode(tokenBytes);

            // Hash token before storing in database
            var tokenHash =
                Convert.ToBase64String(
                    SHA256.HashData(
                        Encoding.UTF8.GetBytes(token)
                    )
                );

            user.ActivationTokenHash = tokenHash;

            user.ActivationTokenExpiry =
                DateTime.UtcNow.AddHours(24);

            // User cannot login until activation
            user.IsActive = false;

            user.CreatedAt = DateTime.UtcNow;

            await _userRepository.AddAsync(user);

            await _unitOfWork.CommitAsync();

            // Create activation link
            var clientBaseUrl =
                _configuration["AppSettings:ClientBaseUrl"];

            var activationLink =
                $"{clientBaseUrl}/activate-account?token={token}";

            // Send activation email
            await _emailService.SendAccountActivationEmailAsync(
                user.Email,
                user.FullName,
                activationLink);
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
