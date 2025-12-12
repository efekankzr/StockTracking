using StockTracking.Domain.Entities;

namespace StockTracking.Application.Interfaces.Repositories
{
    public interface IStockRepository : IGenericRepository<Stock>
    {
        Task<List<Stock>> GetAllWithDetailsAsync();
    }
}
