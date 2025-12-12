using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockTracking.Application.DTOs.Stock;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StockTracking.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StockController : ControllerBase
    {
        private readonly IStockService _service;

        public StockController(IStockService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,DepoSorumlusu,SatisPersoneli")]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllStocksAsync();
            return Ok(response);
        }

        [HttpGet("product/{id}")]
        [Authorize(Roles = "Admin,DepoSorumlusu,SatisPersoneli")]
        public async Task<IActionResult> GetByProduct(int id)
        {
            var response = await _service.GetStockByProductIdAsync(id);
            return Ok(response);
        }

        [HttpPost("entry")]
        [Authorize(Roles = "Admin,DepoSorumlusu")]
        public async Task<IActionResult> CreateEntry(CreateStockEntryDto request)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized(ServiceResponse<bool>.Fail("Kimlik doðrulanamadý."));

            int userId = int.Parse(userIdString);

            var response = await _service.CreateStockEntryAsync(request, userId);

            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
