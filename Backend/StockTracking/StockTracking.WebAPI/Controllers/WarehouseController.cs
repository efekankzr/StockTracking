using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Application.Interfaces.Services;
using System.Threading.Tasks;

namespace StockTracking.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WarehouseController : ControllerBase
    {
        private readonly IWarehouseService _service;

        public WarehouseController(IWarehouseService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,DepoSorumlusu,SatisPersoneli")]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return Ok(response);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,DepoSorumlusu,SatisPersoneli")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _service.GetByIdAsync(id);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateWarehouseDto request)
        {
            var response = await _service.CreateAsync(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(UpdateWarehouseDto request)
        {
            var response = await _service.UpdateAsync(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _service.DeleteAsync(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("activate/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Activate(int id)
        {
            var response = await _service.ActivateAsync(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("hard-delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> HardDelete(int id)
        {
            var response = await _service.HardDeleteAsync(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
