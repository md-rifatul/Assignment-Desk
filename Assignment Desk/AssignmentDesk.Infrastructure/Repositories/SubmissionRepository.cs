using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
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
    public class SubmissionRepository : Repository<Submission>, ISubmissionRepository
    {
        public readonly ApplicationDbContext _context;
        public SubmissionRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> CountAsync(Expression<Func<Submission, bool>> predicate)
        {
            return await _context.Submissions.CountAsync(predicate);
        }

        public async Task<IEnumerable<Submission>> GetAllAssignmentsByStudentId(int studentId)
        {
            return await _context.Submissions
                .Include(x => x.Student)
                .Include(x => x.Assignment)
                    .ThenInclude(x => x.Subject)
                .Where(x => x.StudentId == studentId).ToListAsync();
        }

        public async Task<Submission?> GetByStudentAndAssignmentAsync(int studentId, int assignmentId)
        {
            return await _context.Submissions
                .Include(x => x.Student)
                .Include(x => x.Assignment)
                    .ThenInclude(x => x.Subject)
                .FirstOrDefaultAsync(x=>x.StudentId==studentId&&x.AssignmentId==assignmentId);
        }

        public async Task<int> GetPendingReviewCountAsync(int teacherId)
        {
            return await _context.Submissions
                .Include(x=>x.Assignment)
                .CountAsync(x=>x.Assignment.TeacherId==teacherId && x.Status == SubmissionStatus.Submitted);
        }

        public async Task<IEnumerable<Submission>> GetSubmissionsByTeacherAsync(int teacherId)
        {
            return await _context.Submissions
                .Include(x => x.Student)
                .Include(x => x.Assignment)
                .ThenInclude(x=>x.Subject)
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
