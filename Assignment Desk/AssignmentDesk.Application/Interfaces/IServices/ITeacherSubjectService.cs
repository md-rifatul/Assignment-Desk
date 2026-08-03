using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface ITeacherSubjectService
    {
        Task AddTeacherToSubject(AssignTeacherSubjectDto dto);
        Task DeleteTeacher(int id);
        Task<IEnumerable<TeacherSubjectResponseDto>> GetSubjectsByTeacherId(int id);
    }
}
