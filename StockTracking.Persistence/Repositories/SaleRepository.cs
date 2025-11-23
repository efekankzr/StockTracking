using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class SaleRepository : GenericRepository<Sale>, ISaleRepository
    {
        public SaleRepository(StockDbContext context) : base(context)
        {
        }
    }
}
