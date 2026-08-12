using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Assignment_Desk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        public SubjectController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        [HttpPost("create")]
        [Authorize(Roles ="Admin")]
        public IActionResult CreateSubject([FromBody] CreateSubjectDto dto)
        {
            _subjectService.AddSubject(dto);
            return Ok();
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllSubjects()
        {
            var subjects = await _subjectService.GetSubjects();
            return Ok(subjects);
        }

        [HttpGet("get/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSubjectById(int id)
        {
            var subject = await _subjectService.GetSubjectById(id);
            return Ok(subject);
        }
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSubjectById(int id)
        {
            await _subjectService.DeleteSubject(id);
            return Ok();
        }
        [HttpPut("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSubject(int id, [FromBody] CreateSubjectDto dto)
        {
            await _subjectService.UpdateSubject(id, dto);
            return Ok();
        }
    }
}