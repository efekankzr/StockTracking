using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly StockDbContext _context;

        public UserRepository(StockDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllWithDetailsAsync()
        {
            // Kullanıcıları çekerken bağlı oldukları Depo'yu (Warehouse) da getir
            return await _context.Users
                .Include(u => u.Warehouse)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
