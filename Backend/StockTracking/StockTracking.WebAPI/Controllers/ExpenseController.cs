using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockTracking.Application.DTOs.Expense;
using StockTracking.Application.Interfaces.Services;
using System.Security.Claims;
using System.Security.Claims;
using System.Threading.Tasks;
using System;

namespace StockTracking.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService _service;

        public ExpenseController(IExpenseService service)
        {
            _service = service;
        }

        // --- KATEGORİ YÖNETİMİ (SADECE ADMIN) ---

        [HttpGet("category")]
        [Authorize(Roles = "Admin,DepoSorumlusu")] // Giriş yaparken seçmek için Depocu da görmeli
        public async Task<IActionResult> GetAllCategories()
        {
            var response = await _service.GetAllCategoriesAsync();
            return Ok(response);
        }

        [HttpPost("category")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory(CreateExpenseCategoryDto request)
        {
            var response = await _service.CreateCategoryAsync(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("category/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var response = await _service.DeleteCategoryAsync(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // --- GİDER FİŞİ İŞLEMLERİ ---

        [HttpGet("transaction")]
        [Authorize(Roles = "Admin,DepoSorumlusu")]
        public async Task<IActionResult> GetAllTransactions()
        {
            // İpucu: Burada kullanıcının rolüne göre filtreleme yapılabilir.
            // Şimdilik tüm listeyi dönüyoruz.
            var response = await _service.GetAllTransactionsAsync();
            return Ok(response);
        }

        [HttpPost("transaction")]
        [Authorize(Roles = "Admin,DepoSorumlusu")]
        public async Task<IActionResult> CreateTransaction(CreateExpenseTransactionDto request)
        {
            // İşlemi yapan kişiyi Token'dan alıyoruz
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int userId = int.Parse(userIdString);

            // Depo Sorumlusu Kontrolü: Sadece kendi deposuna gider girebilir
            if (User.IsInRole("DepoSorumlusu"))
            {
                var userWarehouseId = User.FindFirst("WarehouseId")?.Value;
                if (userWarehouseId != null && int.Parse(userWarehouseId) != request.WarehouseId)
                {
                    return BadRequest("Sadece sorumlu olduğunuz depoya gider girişi yapabilirsiniz.");
                }
            }

            var response = await _service.CreateTransactionAsync(request, userId);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("transaction/{id}")]
        [Authorize(Roles = "Admin")] // Gider silmek kritik iştir, sadece Admin yapsın
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var response = await _service.DeleteTransactionAsync(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("report")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var response = await _service.GetDetailedReportAsync(startDate, endDate);
            return Ok(response);
        }
    }
}