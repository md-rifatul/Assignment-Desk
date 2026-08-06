using AssignmentDesk.Application.Interfaces.IRepository.Common;
using AssignmentDesk.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IRepository
{
    public interface IAssignmentRepository : IReadRepository<Assignment>, IWriteRepository<Assignment>
    {
        Task<IEnumerable<Assignment>> GetAllAssignmentsByTeacherIdAsync(int teacherId);
        Task<Assignment> GetAssignmentByIdAndTeacherIdAsync(int id,int teacherId);
        Task<IEnumerable<Assignment>> GetAllAssignmentsByClassIdAsync(int classId);
        Task<int> CountAsync();

    }
}
