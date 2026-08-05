using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Infrastructure.Repositories
{
    public class StudentClassRepository : Repository<StudentClass>, IStudentClassRepository
    {
        private readonly ApplicationDbContext _context;
        public StudentClassRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> ExistsAsync(Expression<Func<StudentClass, bool>> predicate)
        {
            return await _context.StudentClasses.AnyAsync(predicate);
        }

        public async Task<StudentClass?> GetByStudentIdAsync(int studentId)
        {
            return await _context.StudentClasses
                        .FirstOrDefaultAsync(x => x.StudentId == studentId);
        }
    }
}
