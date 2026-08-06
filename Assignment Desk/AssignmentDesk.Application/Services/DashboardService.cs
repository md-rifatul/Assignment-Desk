using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Services
{
    public class DashboardServicen : IDashboardService
    {
        public Task<AdminDashboardDto> GetAdminDashboard()
        {
            throw new NotImplementedException();
        }

        public Task<StudentDashboardDto> GetStudentDashboard()
        {
            throw new NotImplementedException();
        }

        public Task<TeacherDashboardDto> GetTeacherDashboard()
        {
            throw new NotImplementedException();
        }
    }
}
