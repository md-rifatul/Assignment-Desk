using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface ISubjectService
    {
        Task AddSubject(CreateSubjectDto dto);
        Task DeleteSubject(int id);
        Task<SubjectResponseDto> GetSubjectById(int id);
        Task<IEnumerable<SubjectResponseDto>> GetSubjects();
        Task UpdateSubject(int id, CreateSubjectDto dto);
    }
}
