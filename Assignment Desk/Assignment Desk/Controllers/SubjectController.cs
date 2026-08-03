using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
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
        public IActionResult CreateSubject([FromBody] CreateSubjectDto dto)
        {
            _subjectService.AddSubject(dto);
            return Ok();
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var subjects = await _subjectService.GetSubjects();
            return Ok(subjects);
        }
    }
}
