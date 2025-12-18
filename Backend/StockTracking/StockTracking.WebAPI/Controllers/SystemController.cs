using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockTracking.Application.Interfaces.Services;
using System.Threading.Tasks;

namespace StockTracking.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IWarehouseService _warehouseService;
        private readonly IProductService _productService;

        public SystemController(
            ICategoryService categoryService,
            IWarehouseService warehouseService,
            IProductService productService)
        {
            _categoryService = categoryService;
            _warehouseService = warehouseService;
            _productService = productService;
        }

        [HttpGet("setup-status")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSetupStatus()
        {
            var categories = await _categoryService.GetAllAsync();
            var warehouses = await _warehouseService.GetAllAsync();
            var products = await _productService.GetAllAsync();

            var hasCategories = categories.Data != null && categories.Data.Count > 0;
            var hasWarehouses = warehouses.Data != null && warehouses.Data.Count > 0;
            var hasProducts = products.Data != null && products.Data.Count > 0;

            var isSystemReady = hasCategories && hasWarehouses && hasProducts;

            return Ok(new
            {
                HasCategories = hasCategories,
                HasWarehouses = hasWarehouses,
                HasProducts = hasProducts,
                IsSystemReady = isSystemReady
            });
        }
    }
}
