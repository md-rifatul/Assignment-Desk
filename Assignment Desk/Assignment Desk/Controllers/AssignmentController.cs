using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Assignment_Desk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignmentController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;
        public AssignmentController(IAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            int teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _assignmentService.AddAssignment(teacherId, dto);
            return Ok();
        }
        [HttpPost("delete")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            int teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _assignmentService.DeleteAssignment(id, teacherId);
            return Ok();
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllAssigmentsBasedOnUser()
        {
            var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var allAssignments = await _assignmentService.GetAllAssignments(teacherId);
            return Ok(allAssignments);
        }
        [HttpPost("update/{id}")]
        public async Task<IActionResult> UpdateAssignmentBasedOnUser(int id, [FromBody] CreateAssignmentDto dto)
        {
            var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _assignmentService.UpdateAssignment(id, teacherId, dto);
            return Ok();
        }

        [HttpGet("student/my-assignments")]
        public async Task<IActionResult> GetMyAssignments()
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var assignments = await _assignmentService.GetMyAssignments(studentId);
            return Ok(assignments);
        }
    }
}
