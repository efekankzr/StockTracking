using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class SaleRepository : GenericRepository<Sale>, ISaleRepository
    {
        private readonly StockTrackingDbContext _context;
        public SaleRepository(StockTrackingDbContext context) : base(context) { _context = context; }

        public async Task<List<Sale>> GetSalesByDateAsync(DateTime date)
        {
            var startDate = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddDays(1);
            
            return await _context.Sales
                .Include(s => s.User)
                .Include(s => s.Warehouse)
                .Include(s => s.ActualSalesPerson)

                .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)

                .Where(s => s.TransactionDate >= startDate && s.TransactionDate < endDate)
                .OrderByDescending(s => s.TransactionDate)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<Sale>> GetLatestSalesAsync(int count)
        {
            return await _context.Sales
                .Include(s => s.User)
                .Include(s => s.Warehouse)
                .Include(s => s.ActualSalesPerson)
                .OrderByDescending(s => s.TransactionDate)
                .Take(count)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<Sale>> GetAllWithItemsAsync()
        {
            return await _context.Sales
                .Include(s => s.User)
                .Include(s => s.Warehouse)
                .Include(s => s.ActualSalesPerson)
                .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)
                .OrderByDescending(s => s.TransactionDate)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
