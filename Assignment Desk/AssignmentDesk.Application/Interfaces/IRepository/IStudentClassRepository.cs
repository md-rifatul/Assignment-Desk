using AssignmentDesk.Application.Interfaces.IRepository.Common;
using AssignmentDesk.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Diagnostics.Eventing.Reader;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IRepository
{
    public interface IStudentClassRepository : IReadRepository<StudentClass>, IWriteRepository<StudentClass>
    {
        Task<bool> ExistsAsync(Expression<Func<StudentClass, bool>> predicate);

    }
}
