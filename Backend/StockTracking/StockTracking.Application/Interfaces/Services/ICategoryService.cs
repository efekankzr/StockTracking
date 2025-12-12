using StockTracking.Application.DTOs.Category;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface ICategoryService
    {
        Task<ServiceResponse<List<CategoryDto>>> GetAllAsync();
        Task<ServiceResponse<CategoryDto>> GetByIdAsync(int id);
        Task<ServiceResponse<CategoryDto>> CreateAsync(CreateCategoryDto request);
        Task<ServiceResponse<bool>> UpdateAsync(UpdateCategoryDto request);
        Task<ServiceResponse<bool>> DeleteAsync(int id);
        Task<ServiceResponse<bool>> ActivateAsync(int id);
        Task<ServiceResponse<bool>> HardDeleteAsync(int id);
    }
}
