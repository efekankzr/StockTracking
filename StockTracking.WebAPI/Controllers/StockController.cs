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

        /// <summary>
        /// Tüm depolardaki stok durumunu listeler.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllStocksAsync();
            return Ok(response);
        }

        /// <summary>
        /// Belirli bir ürünün hangi depolarda ne kadar olduğunu gösterir.
        /// </summary>
        [HttpGet("product/{id}")]
        public async Task<IActionResult> GetByProduct(int id)
        {
            var response = await _service.GetStockByProductIdAsync(id);
            return Ok(response);
        }

        /// <summary>
        /// Manuel Stok Girişi (Mal Kabul, Sayım Fazlası vb.)
        /// </summary>
        [HttpPost("entry")]
        public async Task<IActionResult> CreateEntry(CreateStockEntryDto request)
        {
            // Token'dan User ID'yi çekiyoruz (System.Security.Claims)
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized(new ServiceResponse<bool>("Kimlik doğrulanamadı."));

            int userId = int.Parse(userIdString);

            var response = await _service.CreateStockEntryAsync(request, userId);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}