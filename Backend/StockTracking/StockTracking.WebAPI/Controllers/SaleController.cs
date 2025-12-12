using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockTracking.Application.DTOs.Sale;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StockTracking.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SaleController : ControllerBase
    {
        private readonly ISaleService _service;

        public SaleController(ISaleService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,SatisPersoneli")]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllSalesAsync();
            return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = "SatisPersoneli")]
        public async Task<IActionResult> Create(CreateSaleDto request)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized(ServiceResponse<bool>.Fail("Kimlik doðrulanamadý."));

            int userId = int.Parse(userIdString);

            var response = await _service.CreateSaleAsync(request, userId);

            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("report")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDailyReport([FromQuery] DateTime? date)
        {
            var queryDate = date ?? DateTime.Now;
            var response = await _service.GetDailyReportAsync(queryDate);
            return Ok(response);
        }

        [HttpGet("summary")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSummary()
        {
            var response = await _service.GetDashboardSummaryAsync();
            return Ok(response);
        }
    }
}
