using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http; // StatusCodes için gerekli
using System.Collections.Generic; // List<> için gerekli
using System.Threading.Tasks; // Task<> için gerekli
using StockTracking.Application.DTOs.Product;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;

namespace StockTracking.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // API genelinde 401 (Yetkisiz) ve 500 (Sunucu Hatası) dönebileceğini belirtiriz
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductController(IProductService service)
        {
            _service = service;
        }

        /// <summary>
        /// Tüm ürünleri listeler.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ServiceResponse<List<ProductListDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return Ok(response);
        }

        /// <summary>
        /// ID'ye göre tek bir ürün getirir.
        /// </summary>
        /// <param name="id">Ürün ID</param>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ServiceResponse<ProductDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ServiceResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get(int id)
        {
            var response = await _service.GetByIdAsync(id);

            if (!response.Success)
                return NotFound(response); // 404 ve Hata mesajı döner

            return Ok(response);
        }

        /// <summary>
        /// Yeni bir ürün oluşturur.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ServiceResponse<ProductDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ServiceResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            // ModelState kontrolüne gerek yok, [ApiController] bunu otomatik yapar.

            var response = await _service.CreateAsync(dto);

            if (!response.Success)
                return BadRequest(response);

            // REST Standardı: 201 Created dönerken, oluşturulan kaynağın linkini (Header'da Location olarak) veririz.
            return CreatedAtAction(nameof(Get), new { id = response.Data.Id }, response);
        }

        /// <summary>
        /// Mevcut ürünü günceller.
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ServiceResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ServiceResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ServiceResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
        {
            // Güvenlik Önlemi: URL'deki ID ile Body'deki ID eşleşiyor mu?
            if (id != dto.Id)
                return BadRequest(new ServiceResponse<object>("URL ID ile Gövde ID eşleşmiyor."));

            var response = await _service.UpdateAsync(dto);

            if (!response.Success)
            {
                // Servis "Bulunamadı" mesajı döndüyse 404, başka hataysa 400 dönebiliriz.
                if (response.Message.Contains("bulunamadı"))
                    return NotFound(response);

                return BadRequest(response);
            }

            return Ok(response);
        }

        /// <summary>
        /// Ürünü siler (Soft Delete önerilir).
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ServiceResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ServiceResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _service.DeleteAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }
    }
}