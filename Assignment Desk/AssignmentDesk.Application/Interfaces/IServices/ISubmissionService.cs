using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface ISubmissionService
    {
        Task UploadSubmission(int studentId, CreateSubmissionDto dto);
        Task Resubmit(int studentId, CreateSubmissionDto dto);
        Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissions(int studentId);
        Task<SubmissionResponseDto> GetSubmission(int studentId, int assignmentId);
    }
}
