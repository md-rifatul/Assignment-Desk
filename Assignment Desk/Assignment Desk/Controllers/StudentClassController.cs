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
    public class StudentClassController : ControllerBase
    {
        private readonly IStudentClassService _studentClassService;
        public StudentClassController(IStudentClassService studentClassService)
        {
            _studentClassService = studentClassService;
        }

        [HttpPost("create")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> AddStudentIntoTheClass([FromBody] CreateStudentClassDto dto)
        {
            try
            {
                await _studentClassService.AddStudentClass(dto);
                return Ok(dto);
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (System.Exception)
            {
                return StatusCode(500, new { message = "An error occurred while assigning the student." });
            }
        }
        [HttpGet("get/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetClassByStudentId(int id)
        {
            var student = await _studentClassService.GetStudentClassById(id);
            return Ok(student);
        }
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> StudentDeleteFromClass(int id)
        {
            await _studentClassService.DeleteStudentClass(id);
            return Ok();
        }
        [HttpPost("update{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStudentFromClass(int id, [FromBody] CreateStudentClassDto dto)
        {
            try
            {
                await _studentClassService.UpdateStudentClass(id, dto);
                return Ok();
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (System.Exception)
            {
                return StatusCode(500, new { message = "An error occurred while updating student class assignment." });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllStudentClasses()
        {
            return Ok(await _studentClassService.GetAllStudentClasses());
        }
    }
}
