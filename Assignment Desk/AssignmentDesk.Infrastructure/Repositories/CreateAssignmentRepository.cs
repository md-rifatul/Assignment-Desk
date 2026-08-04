using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Infrastructure.Repositories
{
    public class CreateAssignmentRepository : Repository<Assignment>, ICreateAssignmentRepository
    {
        private readonly ApplicationDbContext _context;
        public CreateAssignmentRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Assignment> GetAssignmentByIdAndTeacherIdAsync(int assignmentId, int teacherId)
        {
            return await _context.Assignments.FirstOrDefaultAsync(x=>x.Id==assignmentId && x.TeacherId==teacherId);
        }

        public async Task<IEnumerable<Assignment>> GetAllAssignmentsByTeacherIdAsync(int teacherId)
        {
            return await _context.Assignments.Where(x => x.TeacherId == teacherId).ToListAsync();
        }
    }
}