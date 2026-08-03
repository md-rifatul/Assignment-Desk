using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Assignment_Desk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IClassService _classService;
        public ClassController(IClassService classService)
        {
            _classService = classService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            await _classService.CreateClass(dto);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClass(int id, [FromBody] CreateClassDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            await _classService.UpdateClass(id, dto);
            return Ok();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClass(int id)
        {
            await _classService.DeleteClass(id);
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClassById(int id)
        {
            var cls = await _classService.GetClassById(id);
            return Ok(cls);
        }

        [HttpGet]
        public async Task<IActionResult> GetClasses()
        {
            var classes = await _classService.GetAllClasses();
            return Ok(classes);
        }

    }
}
