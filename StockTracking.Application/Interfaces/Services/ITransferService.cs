using StockTracking.Application.DTOs.Transfer;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface ITransferService
    {
        Task<ServiceResponse<List<TransferDto>>> GetAllAsync();
        Task<ServiceResponse<List<TransferDto>>> GetByWarehouseIdAsync(int warehouseId);
        Task<ServiceResponse<bool>> CreateTransferAsync(CreateTransferDto request, int userId);
        Task<ServiceResponse<bool>> ApproveTransferAsync(int transferId, int userId);
        Task<ServiceResponse<bool>> CancelTransferAsync(int transferId, int userId);
    }
}