using StockTracking.Domain.Entities;

namespace StockTracking.Application.Interfaces.Repositories
{
    public interface ITransferRepository : IGenericRepository<StockTransfer>
    {
        Task<List<StockTransfer>> GetAllWithDetailsAsync();
        Task<List<StockTransfer>> GetByWarehouseIdWithDetailsAsync(int warehouseId);
    }
}
