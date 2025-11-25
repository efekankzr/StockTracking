using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class ProductRepository : GenericRepository<Product>, IProductRepository
    {
        private readonly StockTrackingDbContext _context;

        public ProductRepository(StockTrackingDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetAllWithDetailsAsync()
        {
            // BURASI ÇOK ÖNEMLİ: .Include ile ilişkili tabloları bağlıyoruz
            return await _context.Products
                .Include(p => p.Category) // Kategori ismini çekmek için
                .Include(p => p.Stocks)   // Toplam stok hesaplamak için
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
