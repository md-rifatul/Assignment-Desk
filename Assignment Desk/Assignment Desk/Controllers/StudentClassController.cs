using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Assignment_Desk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentClassController : ControllerBase
    {
        private readonly IStudentClassService _studentClassService;
        public StudentClassController(IStudentClassService studentClassService)
        {
            _studentClassService = studentClassService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> AddStudentIntoTheClass([FromBody] CreateStudentClassDto dto)
        {
            await _studentClassService.AddStudentClass(dto);
            return Ok(dto);
        }
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetClassByStudentId(int id)
        {
            var student = await _studentClassService.GetStudentClassById(id);
            return Ok(student);
        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> StudentDeleteFromClass(int id)
        {
            await _studentClassService.DeleteStudentClass(id);
            return Ok();
        }
        [HttpPost("update{id}")]
        public async Task<IActionResult> UpdateStudentFromClass(int id, [FromBody] CreateStudentClassDto dto)
        {
            await _studentClassService.UpdateStudentClass(id, dto);
            return Ok();
        }
    }
}
