using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Application.Interfaces.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Desk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IAdminService _adminService;
        public UserController(IAdminService adminService)
        {
            _adminService = adminService;
        }


        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create( [FromBody] RegisterDto dto)
        {
            await _adminService.Create(dto);
            return Ok();
        }


        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers()
        {
            return Ok(await _adminService.GetUsers());
        }

        [HttpGet("get/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await _adminService.GetById(id));
        }


        [HttpPut("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, RegisterDto dto)
        {
            await _adminService.Update(id, dto);
            return Ok();
        }


        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _adminService.Delete(id);
            return Ok();
        }
    }
}
