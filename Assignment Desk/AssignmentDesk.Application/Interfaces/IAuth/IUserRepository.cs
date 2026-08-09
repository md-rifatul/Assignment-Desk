using AssignmentDesk.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IAuth
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);

        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task<IEnumerable<User>> GetUsers();
        Task<User?> GetByIdAsync(int id);
        Task<int> CountAsync(Expression<Func<User, bool>> predicate);
        Task<User?> GetUserByEmail(string email);
        Task<User?> GetUserByResetTokenHashAsync(string tokenHash);

    }
}
