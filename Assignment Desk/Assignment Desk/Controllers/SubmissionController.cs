using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Assignment_Desk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubmissionController : ControllerBase
    {
        private readonly ISubmissionService _submissionService;
        public SubmissionController(ISubmissionService submissionService)
        {
            _submissionService = submissionService;
        }
        [HttpPost("submit")]
        public async Task<IActionResult> UploadSubmission([FromForm] CreateSubmissionDto dto)
        {
            int studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _submissionService.UploadSubmission(studentId, dto);
            return Ok();
        }
        [HttpPut("resubmit/{id}")]
        public async Task<IActionResult> ResubmitSolution(int id, [FromForm] ResubmitSubmissionDto dto)
        {
            int studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _submissionService.Resubmit(id, studentId, dto);
            return Ok();
        }
        [HttpGet("teacher/submissions")]
        public async Task<IActionResult> GetStudentSubmissions()
        {
            int teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _submissionService.GetStudentSubmissions(teacherId);
            return Ok(result);
        }
        [HttpPut("review/{submissionId}")]
        public async Task<IActionResult> ReviewSubmission(int submissionId, [FromBody] ReviewSubmissionDto dto)
        {
            int teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _submissionService.ReviewSubmission(submissionId,teacherId,dto);
            return Ok();
        }

    }
}
