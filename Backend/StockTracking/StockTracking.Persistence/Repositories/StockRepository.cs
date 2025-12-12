using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class StockRepository : GenericRepository<Stock>, IStockRepository
    {
        private readonly StockTrackingDbContext _context;

        public StockRepository(StockTrackingDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Stock>> GetAllWithDetailsAsync()
        {
            return await _context.Stocks
                .Include(s => s.Product)
                .Include(s => s.Warehouse)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
