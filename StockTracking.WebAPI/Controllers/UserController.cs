using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.Interfaces.Services;
using System.Threading.Tasks;

namespace StockTracking.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Sadece Admin görebilir
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(CreateUserDto request)
        {
            var response = await _userService.CreateUserAsync(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var response = await _userService.GetAllAsync();
            return Ok(response);
        }
    }
}