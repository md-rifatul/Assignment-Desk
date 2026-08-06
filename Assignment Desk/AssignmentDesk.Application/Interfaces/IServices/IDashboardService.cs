using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface IDashboardService
    {
        Task<AdminDashboardDto> GetAdminDashboard();
        Task<TeacherDashboardDto> GetTeacherDashboard(int teacherId);
        Task<StudentDashboardDto> GetStudentDashboard();
    }
}
