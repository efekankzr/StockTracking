using StockTracking.Application.DTOs.Stock;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface IStockService
    {
        Task<ServiceResponse<List<StockDto>>> GetAllStocksAsync();
        Task<ServiceResponse<List<StockDto>>> GetStockByProductIdAsync(int productId);
        Task<ServiceResponse<bool>> CreateStockEntryAsync(CreateStockEntryDto request, int currentUserId);
    }
}
