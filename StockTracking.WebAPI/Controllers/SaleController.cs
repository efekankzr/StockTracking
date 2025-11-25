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

        /// <summary>
        /// Tüm satış geçmişini listeler.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllSalesAsync();
            return Ok(response);
        }

        /// <summary>
        /// Yeni satış işlemi yapar ve stoktan düşer.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create(CreateSaleDto request)
        {
            // Token'dan User ID'yi al
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized(new ServiceResponse<bool>("Kimlik doğrulanamadı."));

            int userId = int.Parse(userIdString);

            var response = await _service.CreateSaleAsync(request, userId);

            if (!response.Success)
                return BadRequest(response); // Yetersiz stok veya olmayan ürün hatası

            return Ok(response);
        }

        [HttpGet("report")]
        public async Task<IActionResult> GetDailyReport([FromQuery] DateTime date)
        {
            var response = await _service.GetDailyReportAsync(date);
            return Ok(response);
        }
    }
}