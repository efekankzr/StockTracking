using StockTracking.Domain.Entities;

namespace StockTracking.Application.Interfaces.Repositories
{
    public interface IProductRepository : IGenericRepository<Product>
    {

        Task<List<Product>> GetAllWithDetailsAsync();
    }
}
