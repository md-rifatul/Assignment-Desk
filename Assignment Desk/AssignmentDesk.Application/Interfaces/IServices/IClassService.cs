using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface IClassService
    {
        Task CreateClass(CreateClassDto dto);
        Task UpdateClass(int id, CreateClassDto dto);
        Task DeleteClass(int id);
        Task<IEnumerable<ClassResponseDto>> GetAllClasses();
        Task<ClassResponseDto> GetClassById(int id);
    }
}
