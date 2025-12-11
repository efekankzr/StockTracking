using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface IWarehouseService
    {
        Task<ServiceResponse<List<WarehouseDto>>> GetAllAsync();
        Task<ServiceResponse<WarehouseDto>> GetByIdAsync(int id);
        Task<ServiceResponse<WarehouseDto>> CreateAsync(CreateWarehouseDto request);
        Task<ServiceResponse<bool>> UpdateAsync(UpdateWarehouseDto request);
        Task<ServiceResponse<bool>> DeleteAsync(int id);
        Task<ServiceResponse<bool>> ActivateAsync(int id);
        Task<ServiceResponse<bool>> HardDeleteAsync(int id);
    }
}