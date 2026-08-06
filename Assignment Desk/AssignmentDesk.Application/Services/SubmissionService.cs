using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Services
{
    public class SubmissionService : ISubmissionService
    {
        private readonly ISubmissionRepository _submissionRepository;
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public SubmissionService(ISubmissionRepository submissionRepository,IAssignmentRepository assignmentRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _submissionRepository = submissionRepository;
            _assignmentRepository = assignmentRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissions(int studentId)
        {
            var submissions = await _submissionRepository.GetAllAssignmentsByStudentId(studentId);
            return _mapper.Map<IEnumerable<SubmissionResponseDto>>(submissions);
        }

        public async Task<IEnumerable<SubmissionResponseDto>> GetStudentSubmissions(int teacherId)
        {
            var submissions = await _submissionRepository.GetSubmissionsByTeacherAsync(teacherId);
            return _mapper.Map<IEnumerable<SubmissionResponseDto>>(submissions);
        }

        public async Task<SubmissionResponseDto> GetSubmission(int studentId, int assignmentId)
        {
            var submission = await _submissionRepository.GetByStudentAndAssignmentAsync(studentId, assignmentId);
            return _mapper.Map<SubmissionResponseDto>(submission);
        }


        public async Task Resubmit(int assignmentId, int studentId, ResubmitSubmissionDto dto)
        {
            // Submission বের করো
            var submission = await _submissionRepository.GetByStudentAndAssignmentAsync(studentId,assignmentId);

            if (submission == null)
                throw new Exception("Submission not found.");

            // নিজের Submission কিনা
            if (submission.StudentId != studentId)
                throw new Exception("You are not authorized.");

            // Assignment বের করো
            var assignment = await _assignmentRepository.GetByIdAsync(submission.AssignmentId);

            if (assignment == null)
                throw new Exception("Assignment not found.");

            if (assignment.Status != AssignmentStatus.Publish)
                throw new Exception("Assignment is not published.");

            if (assignment.Deadline < DateTime.UtcNow)
                throw new Exception("Submission deadline is over.");

            // PDF Validation
            if (dto.PdfFile == null || dto.PdfFile.Length == 0)
                throw new Exception("Please upload a PDF.");

            if (Path.GetExtension(dto.PdfFile.FileName).ToLower() != ".pdf")
                throw new Exception("Only PDF file is allowed.");

            // Folder
            var folder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "submissions");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            // পুরনো File Delete
            if (!string.IsNullOrWhiteSpace(submission.FileUrl))
            {
                var oldFilePath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    submission.FileUrl.TrimStart('/')
                        .Replace("/", Path.DirectorySeparatorChar.ToString()));

                if (File.Exists(oldFilePath))
                {
                    File.Delete(oldFilePath);
                }
            }

            // নতুন File Upload
            var fileName = Guid.NewGuid() +
                           Path.GetExtension(dto.PdfFile.FileName);

            var newFilePath = Path.Combine(folder, fileName);

            using (var stream = new FileStream(newFilePath, FileMode.Create))
            {
                await dto.PdfFile.CopyToAsync(stream);
            }

            // Update
            submission.FileUrl = "/uploads/submissions/" + fileName;
            submission.SubmittedAt = DateTime.UtcNow;

            await _unitOfWork.CommitAsync();
        }

        public async Task ReviewSubmission(int submissionId, int teacherId, ReviewSubmissionDto dto)
        {
            var submission = await _submissionRepository.GetSubmissionWithAssignmentAsyncBySubmissionId(submissionId);
            if (submission == null)
                throw new Exception("Submission not found.");
            if (submission.Assignment.TeacherId != teacherId)
                throw new Exception("Your are not allowed for review");
            if (dto.Marks > submission.Assignment.MaximumMarks)
                throw new Exception("Marks exceed maximum marks.");
            if (dto.Marks < 0)
                throw new Exception("Invalid Marks");

            submission.Marks = dto.Marks;
            submission.Feedback = dto.Feedback;

            await _unitOfWork.CommitAsync();
        }

        public async Task UploadSubmission(int studentId, CreateSubmissionDto dto)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(dto.AssignmentId);

            if (assignment == null)
                throw new Exception("Assignment not found");
            if (assignment.Status != AssignmentStatus.Publish)
                throw new Exception("Assignment is not publish");
            if (assignment.Deadline < DateTime.UtcNow)
                throw new Exception("Submission Dadeline is over");


            var existingSubmission = await _submissionRepository.GetByStudentAndAssignmentAsync(studentId, dto.AssignmentId);

            if (existingSubmission != null)
                throw new Exception("You have already submitted this assignment.");

            var folder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "submissions"
                );

            if(!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() +
                Path.GetExtension(dto.PdfFile.FileName);

            var filePath = Path.Combine(folder, fileName);

            using(var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.PdfFile.CopyToAsync(stream);
            }

            var submission = _mapper.Map<Submission>(dto);

            submission.StudentId = studentId;
            submission.FileUrl = "/uploads/submissions/" + fileName;
            submission.SubmittedAt = DateTime.UtcNow;
            
            await _submissionRepository.AddAsync(submission);
            await _unitOfWork.CommitAsync();
        }
    }
}
