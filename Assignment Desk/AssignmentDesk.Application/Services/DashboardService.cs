using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IUserRepository _userRepository;
        private readonly IClassRepository _classRepository;
        private readonly ISubjectRepository _subjectRepository;
        private readonly IAssignmentRepository _assignmentRepository;
        public DashboardService(IUserRepository userRepository , IClassRepository classRepository, ISubjectRepository subjectRepository, IAssignmentRepository assignmentRepository)
        {
            _userRepository = userRepository;
            _classRepository = classRepository;
            _subjectRepository = subjectRepository;
            _assignmentRepository = assignmentRepository;
        }
        public async Task<AdminDashboardDto> GetAdminDashboard()
        {
            return new AdminDashboardDto
            {
                TotalTeachers = await _userRepository.CountAsync(x => x.Role == UserRole.Teacher),
                TotalStudents = await _userRepository.CountAsync(x => x.Role == UserRole.Student),
                TotalClasses = await _classRepository.CountAsync(),
                TotalSubjects = await _subjectRepository.CountAsync(),
                TotalAssignments = await _assignmentRepository.CountAsync()
            };
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
