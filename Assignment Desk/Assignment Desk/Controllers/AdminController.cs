using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Desk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }


        [HttpPost]
        public async Task<IActionResult> Create( [FromBody] RegisterDto dto)
        {
            await _adminService.Create(dto);
            return Ok();
        }


        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            return Ok(await _adminService.GetUsers());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await _adminService.GetById(id));
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, RegisterDto dto)
        {
            await _adminService.Update(id, dto);
            return Ok();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _adminService.Delete(id);
            return Ok();
        }
    }
}
