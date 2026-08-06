using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
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
    public class AssignmentRepository : Repository<Assignment>, IAssignmentRepository
    {
        private readonly ApplicationDbContext _context;
        public AssignmentRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Assignment> GetAssignmentByIdAndTeacherIdAsync(int assignmentId, int teacherId)
        {
            return await _context.Assignments.FirstOrDefaultAsync(x=>x.Id==assignmentId && x.TeacherId==teacherId);
        }

        public async Task<IEnumerable<Assignment>> GetAllAssignmentsByTeacherIdAsync(int teacherId)
        {
            return await _context.Assignments
                    .Include(x => x.Subject)
                    .Include(x => x.Teacher)
                    .Where(x => x.TeacherId == teacherId)
                    .ToListAsync();
        }

        public async Task<IEnumerable<Assignment>> GetAllAssignmentsByClassIdAsync(int classId)
        {
            return await _context.Assignments.Include(x=>x.Subject).Where(x=>x.ClassId==classId && x.Status==AssignmentStatus.Publish).ToListAsync();
        }

        public async Task<int> CountAsync()
        {
            return await _context.Assignments.CountAsync();
        }

        public async Task<int> GetAssignmentCountByTeacherIdAsync(int teacherId)
        {
            return await _context.Assignments.CountAsync(x => x.TeacherId == teacherId && x.Status==AssignmentStatus.Publish);
        }
    }
}