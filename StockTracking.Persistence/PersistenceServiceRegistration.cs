using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Persistence.Context;
using StockTracking.Persistence.Repositories;

namespace StockTracking.Persistence
{
    public static class PersistenceServiceRegistration
    {
        public static void AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
        {
            // DbContext
            services.AddDbContext<StockDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            // Repositories & UnitOfWork
            // Generic Repo'yu eklemeyi unutma
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Eğer özel repo kullanacaksan (ProductRepository gibi) onları da buraya ekle
            services.AddScoped<IProductRepository, ProductRepository>();
            // services.AddScoped<IUserRepository, UserRepository>(); vs...
        }
    }
}