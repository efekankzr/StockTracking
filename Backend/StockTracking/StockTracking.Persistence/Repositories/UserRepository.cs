using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly StockTrackingDbContext _context;

        public UserRepository(StockTrackingDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllWithDetailsAsync()
        {
            return await _context.Users
                .Include(u => u.Warehouse)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
