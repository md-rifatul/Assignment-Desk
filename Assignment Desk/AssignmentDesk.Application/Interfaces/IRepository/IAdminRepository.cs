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
    public interface IAdminRepository : IReadRepository<User>, IWriteRepository<User>
    {
        Task<IEnumerable<User>> SearchAsync(string search);
    }
}
