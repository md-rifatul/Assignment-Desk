using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface ICreateAssignmentService
    {
        Task AddAssignment(int teacherId, CreateAssignmentDto dto);
        Task DeleteAssignment(int id, int teacherId);
        Task UpdateAssignment(int id, int teacherId, CreateAssignmentDto dto);
        Task<AssignmentResponseDto> GetAssignmentById(int id, int teacherId);
        Task<IEnumerable<AssignmentResponseDto>> GetAllAssignments(int teacherId);
    }
}
