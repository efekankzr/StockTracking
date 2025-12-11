using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class StockLogRepository : GenericRepository<StockLog>, IStockLogRepository
    {
        public StockLogRepository(StockTrackingDbContext context) : base(context)
        {
        }
    }
}
