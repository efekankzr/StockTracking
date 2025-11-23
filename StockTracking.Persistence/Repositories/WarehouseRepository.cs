using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class WarehouseRepository : GenericRepository<Warehouse>, IWarehouseRepository
    {
        public WarehouseRepository(StockDbContext context) : base(context)
        {
        }
    }
}
