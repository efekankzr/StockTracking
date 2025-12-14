using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class ExpenseTransactionRepository : GenericRepository<ExpenseTransaction>, IExpenseTransactionRepository
    {
        public ExpenseTransactionRepository(StockTrackingDbContext context) : base(context)
        {
        }

        public async Task<List<ExpenseTransaction>> GetAllWithDetailsAsync()
        {
            return await _context.ExpenseTransactions
                .Include(x => x.ExpenseCategory)
                .Include(x => x.Warehouse)
                .Include(x => x.User)
                .OrderByDescending(x => x.DocumentDate)
                .ToListAsync();
        }

        public async Task<List<ExpenseTransaction>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
             return await _context.ExpenseTransactions
                .Include(x => x.ExpenseCategory)
                .Where(x => x.DocumentDate >= startDate && x.DocumentDate <= endDate)
                .OrderBy(x => x.DocumentDate)
                .ToListAsync();
        }
    }
}
