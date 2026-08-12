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
    public class SubjectRepository : Repository<Subject>, ISubjectRepository
    {
        private readonly ApplicationDbContext _context;
        public SubjectRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }


        public async Task<int> CountAsync(Expression<Func<Subject, bool>> predicate)
        {
            return await _context.Subjects.CountAsync(predicate);
        }

        public async Task<int> CountAsync()
        {
            return await _context.Subjects.CountAsync();
        }

        public Task<IEnumerable<Subject>> SearchAsync(string search)
        {
            throw new NotImplementedException();
        }
    }
}
