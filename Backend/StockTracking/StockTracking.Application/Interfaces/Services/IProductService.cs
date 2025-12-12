using StockTracking.Application.DTOs.Product;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface IProductService
    {
        Task<ServiceResponse<List<ProductListDto>>> GetAllAsync();
        Task<ServiceResponse<ProductDto>> GetByIdAsync(int id);
        Task<ServiceResponse<ProductDto>> CreateAsync(CreateProductDto request);
        Task<ServiceResponse<bool>> UpdateAsync(UpdateProductDto request);
        Task<ServiceResponse<bool>> DeleteAsync(int id);
        Task<ServiceResponse<bool>> ActivateAsync(int id);
        Task<ServiceResponse<bool>> HardDeleteAsync(int id);
    }
}
