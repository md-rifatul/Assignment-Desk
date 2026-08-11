using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
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
        private readonly ITeacherSubjectRepository _teacherSubjectRepository;
        private readonly ISubmissionRepository _submissionRepository;
        private readonly IStudentClassRepository _studentClassRepository;
        private readonly IMapper _mapper;

        public DashboardService(
            IUserRepository userRepository, 
            IClassRepository classRepository, 
            ISubjectRepository subjectRepository, 
            IAssignmentRepository assignmentRepository, 
            ITeacherSubjectRepository teacherSubjectRepository, 
            ISubmissionRepository submissionRepository, 
            IStudentClassRepository studentClassRepository,
            IMapper mapper)
        {
            _userRepository = userRepository;
            _classRepository = classRepository;
            _subjectRepository = subjectRepository;
            _assignmentRepository = assignmentRepository;
            _teacherSubjectRepository = teacherSubjectRepository;
            _submissionRepository = submissionRepository;
            _studentClassRepository = studentClassRepository;
            _mapper = mapper;
        }

        public async Task<AdminDashboardDto> GetAdminDashboard()
        {
            var assignments = await _assignmentRepository.GetAllAsync(
                include: q => q.Include(a => a.Subject).Include(a => a.Class)
            );

            var submissions = await _submissionRepository.GetAllAsync(
                include: q => q.Include(s => s.Student)
                               .Include(s => s.Assignment)
                                   .ThenInclude(a => a.Subject)
                               .Include(s => s.Assignment)
                                   .ThenInclude(a => a.Class)
            );

            return new AdminDashboardDto
            {
                TotalTeachers = await _userRepository.CountAsync(x => x.Role == UserRole.Teacher),
                TotalStudents = await _userRepository.CountAsync(x => x.Role == UserRole.Student),
                TotalClasses = await _classRepository.CountAsync(),
                TotalSubjects = await _subjectRepository.CountAsync(),
                TotalAssignments = await _assignmentRepository.CountAsync(),
                RecentAssignments = _mapper.Map<IEnumerable<AssignmentResponseDto>>(
                    assignments.OrderByDescending(a => a.CreatedAt)
                ),
                RecentSubmissions = _mapper.Map<IEnumerable<SubmissionResponseDto>>(
                    submissions.OrderByDescending(s => s.SubmittedAt)
                )
            };
        }

        public async Task<StudentDashboardDto> GetStudentDashboard(int studentId)
        {
            var studentClass = await _studentClassRepository.GetByStudentIdAsync(studentId);

            if (studentClass == null)
                throw new Exception("Student is not assigned to any class.");

            var classId = studentClass.ClassId;

            return new StudentDashboardDto
            {
                MySubjects = await _subjectRepository.CountAsync(x => x.ClassId == classId),
                MyAssignments = await _assignmentRepository.CountAsync(x => x.ClassId == classId),
                SubmittedAssignments = await _submissionRepository.CountAsync(x=>x.StudentId == studentId),
                PendingAssignments = await _assignmentRepository.CountPendingAssignmentsAsync(studentId, classId),
                ReviewedAssignments = await _submissionRepository.CountAsync(x=>x.StudentId==studentId && x.Status==SubmissionStatus.Reviewed)
            };
        }

        public async Task<TeacherDashboardDto> GetTeacherDashboard(int teacherId)
        {
            return new TeacherDashboardDto
            {
                MySubjects = await _teacherSubjectRepository.GetSubjectCountByTeacherIdAsync(teacherId),
                MyAssignments = await _assignmentRepository.GetAssignmentCountByTeacherIdAsync(teacherId),
                PendingReview = await _submissionRepository.GetPendingReviewCountAsync(teacherId)
            };
        }
    }
}
