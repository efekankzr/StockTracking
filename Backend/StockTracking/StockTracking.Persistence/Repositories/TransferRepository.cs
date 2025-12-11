using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class TransferRepository : GenericRepository<StockTransfer>, ITransferRepository
    {
        private readonly StockTrackingDbContext _context;

        public TransferRepository(StockTrackingDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<StockTransfer>> GetAllWithDetailsAsync()
        {
            return await _context.Set<StockTransfer>()
                .Include(t => t.Product)
                .Include(t => t.SourceWarehouse)
                .Include(t => t.TargetWarehouse)
                .Include(t => t.CreatedByUser)
                .OrderByDescending(t => t.CreatedDate)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<StockTransfer>> GetByWarehouseIdWithDetailsAsync(int warehouseId)
        {
            return await _context.Set<StockTransfer>()
                .Include(t => t.Product)
                .Include(t => t.SourceWarehouse)
                .Include(t => t.TargetWarehouse)
                .Include(t => t.CreatedByUser)
                .Where(t => t.SourceWarehouseId == warehouseId || t.TargetWarehouseId == warehouseId)
                .OrderByDescending(t => t.CreatedDate)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}