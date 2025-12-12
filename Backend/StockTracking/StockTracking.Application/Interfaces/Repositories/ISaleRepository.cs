using StockTracking.Domain.Entities;

namespace StockTracking.Application.Interfaces.Repositories
{
    public interface ISaleRepository : IGenericRepository<Sale>
    {
        Task<List<Sale>> GetSalesByDateAsync(DateTime date);
        Task<List<Sale>> GetLatestSalesAsync(int count);
    }
}
