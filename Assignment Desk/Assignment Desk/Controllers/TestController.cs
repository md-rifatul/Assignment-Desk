using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AssignmentDesk.Domain.Exceptions;
using System;

namespace Assignment_Desk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TestController : ControllerBase
    {
        [HttpGet("jwttest")]
        public IActionResult Get()
        {
            return Ok("JWT Working");
        }

        [HttpGet("test404")]
        [AllowAnonymous]
        public IActionResult Get404()
        {
            throw new NotFoundException("Test assignment not found.");
        }

        [HttpGet("test400")]
        [AllowAnonymous]
        public IActionResult Get400()
        {
            throw new BadRequestException("Test bad request data.");
        }

        [HttpGet("test403")]
        [AllowAnonymous]
        public IActionResult Get403()
        {
            throw new ForbiddenException("Test forbidden action.");
        }

        [HttpGet("test500")]
        [AllowAnonymous]
        public IActionResult Get500()
        {
            throw new Exception("Test unexpected database failure.");
        }
    }
}
