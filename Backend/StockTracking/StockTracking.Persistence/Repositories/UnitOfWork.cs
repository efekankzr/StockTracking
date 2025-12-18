using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly StockTrackingDbContext _context;

        private IProductRepository? _products;
        private ICategoryRepository? _categories;
        private IWarehouseRepository? _warehouses;
        private IStockRepository? _stocks;
        private IStockLogRepository? _stockLogs;
        private ISaleRepository? _sales;
        private IUserRepository? _users;
        private ITransferRepository? _stockTransfers;

        public UnitOfWork(StockTrackingDbContext context)
        {
            _context = context;
        }

        public IProductRepository Products => _products ??= new ProductRepository(_context);
        public ICategoryRepository Categories => _categories ??= new CategoryRepository(_context);
        public IWarehouseRepository Warehouses => _warehouses ??= new WarehouseRepository(_context);
        public IStockRepository Stocks => _stocks ??= new StockRepository(_context);
        public IStockLogRepository StockLogs => _stockLogs ??= new StockLogRepository(_context);
        public ISaleRepository Sales => _sales ??= new SaleRepository(_context);
        public IUserRepository Users => _users ??= new UserRepository(_context);
        public ITransferRepository StockTransfers => _stockTransfers ??= new TransferRepository(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async ValueTask DisposeAsync()
        {
            await _context.DisposeAsync();
        }
    }
}
