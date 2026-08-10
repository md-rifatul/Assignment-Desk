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
    public class TeacherSubjectController : ControllerBase
    {
        private readonly ITeacherSubjectService _teacherSubjectService;
        public TeacherSubjectController(ITeacherSubjectService teacherSubjectService)
        {
            _teacherSubjectService = teacherSubjectService;
        }

        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTeacherToSubject([FromBody] AssignTeacherSubjectDto dto)
        {
            if (dto == null)
                return BadRequest();
            await _teacherSubjectService.AddTeacherToSubject(dto);
            return Ok();
        }
        [HttpPost("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTeacherToSubject(int id)
        {
             await _teacherSubjectService.DeleteTeacher(id);
            return Ok();
        }

        [HttpGet("get{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSubjectsByTeacherId(int id)
        {
            var subjects = await _teacherSubjectService.GetSubjectsByTeacherId(id);
            return Ok(subjects);
        }
    }
}
