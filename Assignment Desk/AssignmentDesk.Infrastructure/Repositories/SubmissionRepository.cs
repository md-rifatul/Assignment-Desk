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
    public class SubmissionRepository : Repository<Submission>, ISubmissionRepository
    {
        public readonly ApplicationDbContext _context;
        public SubmissionRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Submission>> GetAllAssignmentsByStudentId(int studentId)
        {
            return await _context.Submissions.Where(x=> x.StudentId == studentId).ToListAsync();
        }

        public async Task<Submission?> GetByStudentAndAssignmentAsync(int studentId, int assignmentId)
        {
            return await _context.Submissions.FirstOrDefaultAsync(x=>x.StudentId==studentId&&x.AssignmentId==assignmentId);
        }

        public async Task<IEnumerable<Submission>> GetSubmissionsByTeacherAsync(int teacherId)
        {
            return await _context.Submissions
                .Include(x => x.Student)
                .Include(x => x.Assignment)
                .Where(x => x.Assignment.TeacherId == teacherId).ToListAsync();
        }

        public async Task<Submission?> GetSubmissionWithAssignmentAsyncBySubmissionId(int submissionId)
        {
            return await _context.Submissions
                .Include(x=>x.Assignment)
                .FirstOrDefaultAsync(x=>x.Id==submissionId);
        }
    }
}
