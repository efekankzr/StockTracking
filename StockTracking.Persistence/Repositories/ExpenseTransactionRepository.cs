using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class ExpenseTransactionRepository : GenericRepository<ExpenseTransaction>, IExpenseTransactionRepository
    {
        private readonly StockTrackingDbContext _context;

        public ExpenseTransactionRepository(StockTrackingDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<ExpenseTransaction>> GetAllWithDetailsAsync()
        {
            return await _context.ExpenseTransactions
                .Include(t => t.ExpenseCategory)
                .Include(t => t.Warehouse)
                .Include(t => t.User)
                .OrderByDescending(t => t.DocumentDate)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}