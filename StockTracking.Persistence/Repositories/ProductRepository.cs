using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class ProductRepository : GenericRepository<Product>, IProductRepository
    {
        public ProductRepository(StockDbContext context) : base(context)
        {
        }

        public async Task<Product?> GetByBarcodeAsync(string barcode)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Barcode == barcode);
        }
    }
}
