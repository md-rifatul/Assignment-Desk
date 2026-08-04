using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface IStudentClassService
    {
        Task AddStudentClass(CreateStudentClassDto dto);
        Task DeleteStudentClass(int id);
        Task<StudentClassResponseDto> GetStudentClassById(int id);
        Task UpdateStudentClass(int id, CreateStudentClassDto dto);

    }
}
