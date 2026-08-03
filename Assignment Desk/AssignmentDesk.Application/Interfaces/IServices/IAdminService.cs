using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface IAdminService
    {
        Task Create(RegisterDto dto);
        Task Delete(int id);
        Task Update(int id, RegisterDto dto);
        Task<IEnumerable<UserResponseDto>> GetUsers();
        Task<UserResponseDto> GetById(int id);
        Task<IEnumerable<UserResponseDto>> SearchAsync(string term);
    }
}
