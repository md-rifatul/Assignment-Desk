using AssignmentDesk.Application.Interfaces.IRepository.Common;
using AssignmentDesk.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IRepository
{
    public interface ISubjectRepository : IRepository<Subject>
    {
        Task<IEnumerable<Subject>> SearchAsync(string search);
        Task<int> CountAsync(Expression<Func<Subject, bool>> predicate);
        Task<int> CountAsync();

    }
}
