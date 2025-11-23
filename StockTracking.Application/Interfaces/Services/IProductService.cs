using StockTracking.Application.DTOs.Product;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface IProductService
    {
        // Tüm ürünleri listele (Listeleme DTO'su döner)
        Task<ServiceResponse<List<ProductListDto>>> GetAllAsync();

        // Tek bir ürün getir (Detay DTO'su döner)
        Task<ServiceResponse<ProductDto>> GetByIdAsync(int id);

        // Yeni ürün ekle (Eklenen ürünü döner)
        Task<ServiceResponse<ProductDto>> CreateAsync(CreateProductDto request);

        // Güncelleme (Başarılı/Başarısız döner)
        Task<ServiceResponse<bool>> UpdateAsync(UpdateProductDto request);

        // Silme (Başarılı/Başarısız döner)
        Task<ServiceResponse<bool>> DeleteAsync(int id);
    }
}