using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly StockDbContext _context;

        public IProductRepository Products { get; }

        public UnitOfWork(StockDbContext context, IProductRepository productRepository)
        {
            _context = context;
            Products = productRepository;
        }

        public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

        public async ValueTask DisposeAsync() => await _context.DisposeAsync();
    }
}
