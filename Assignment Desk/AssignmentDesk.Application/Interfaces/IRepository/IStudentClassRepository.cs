using AssignmentDesk.Application.Interfaces.IRepository.Common;
using AssignmentDesk.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IRepository
{
    public interface IStudentClassRepository : IReadRepository<StudentClass>, IWriteRepository<StudentClass>
    {
        Task<IEnumerable<StudentClass>> SearchAsync(string search);

    }
}
