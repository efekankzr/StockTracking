using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities;
using StockTracking.Persistence.Context;

namespace StockTracking.Persistence.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(StockDbContext context) : base(context)
        {
        }
    }
}
