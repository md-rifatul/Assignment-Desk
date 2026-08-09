using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using AssignmentDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Infrastructure.Repositories.Auth
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IUnitOfWork _unitOfWork;

        public UserRepository(ApplicationDbContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Update(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.Remove(user);
            await _unitOfWork.CommitAsync();
        }

        public async Task<IEnumerable<User>> GetUsers()
        {
            var users = _context.Users
                .Where(x=>x.Role!=UserRole.Admin).ToListAsync();
            return await users;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);
            return user;
        }

        public async Task<int> CountAsync(Expression<Func<User, bool>> predicate)
        {
            return await _context.Users.CountAsync(predicate);
        }
    }
}
