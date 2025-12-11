using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockTracking.Application.DTOs.Transfer;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StockTracking.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransferController : ControllerBase
    {
        private readonly ITransferService _service;

        public TransferController(ITransferService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,DepoSorumlusu")]
        public async Task<IActionResult> GetAll()
        {
            if (User.IsInRole("Admin"))
            {
                var response = await _service.GetAllAsync();
                return Ok(response);
            }

            var warehouseIdClaim = User.FindFirst("WarehouseId")?.Value;
            if (string.IsNullOrEmpty(warehouseIdClaim))
            {
                return BadRequest(new ServiceResponse<object>("Kullanıcının deposu bulunamadı."));
            }

            var responseDepo = await _service.GetByWarehouseIdAsync(int.Parse(warehouseIdClaim));
            return Ok(responseDepo);
        }

        [HttpPost("create")]
        [Authorize(Roles = "Admin,DepoSorumlusu")]
        public async Task<IActionResult> Create(CreateTransferDto request)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            int userId = int.Parse(userIdString);

            if (User.IsInRole("DepoSorumlusu"))
            {
                var userWarehouseId = User.FindFirst("WarehouseId")?.Value;
                if (userWarehouseId != null && int.Parse(userWarehouseId) != request.SourceWarehouseId)
                {
                    return BadRequest(new ServiceResponse<bool>("Sadece sorumlu olduğunuz depodan transfer başlatabilirsiniz."));
                }
            }

            var response = await _service.CreateTransferAsync(request, userId);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("approve/{id}")]
        [Authorize(Roles = "Admin,DepoSorumlusu")]
        public async Task<IActionResult> Approve(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = int.Parse(userIdString!);

            var response = await _service.ApproveTransferAsync(id, userId);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("cancel/{id}")]
        [Authorize(Roles = "Admin,DepoSorumlusu")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = int.Parse(userIdString!);

            var response = await _service.CancelTransferAsync(id, userId);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}