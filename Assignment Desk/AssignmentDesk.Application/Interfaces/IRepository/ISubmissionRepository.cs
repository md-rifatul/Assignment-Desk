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
    public interface ISubmissionRepository : IRepository<Submission>
    {
        Task<Submission?> GetByStudentAndAssignmentAsync(int studentId, int assignmentId);
        Task<IEnumerable<Submission>> GetAllAssignmentsByStudentId(int studentId);
        Task<IEnumerable<Submission>> GetSubmissionsByTeacherAsync(int teacherId);
        Task<Submission?> GetSubmissionWithAssignmentAsyncBySubmissionId(int submissionId);
        Task<int> GetPendingReviewCountAsync(int teacherId);
        Task<int> CountAsync(Expression<Func<Submission, bool>> predicate);

    }
}
