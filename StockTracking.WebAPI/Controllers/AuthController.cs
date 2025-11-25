using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using System.Threading.Tasks;

namespace StockTracking.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(ServiceResponse<TokenDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ServiceResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var response = await _authService.LoginAsync(request);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateUser(CreateUserDto request)
        {
            var response = await _authService.CreateUserAsync(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
