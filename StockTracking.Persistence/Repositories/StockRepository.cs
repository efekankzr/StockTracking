using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class StockRepository : GenericRepository<Stock>, IStockRepository
    {
        public StockRepository(StockDbContext context) : base(context)
        {
        }
    }
}
