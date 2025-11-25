using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Services;
using System.Reflection;

namespace StockTracking.Application
{
    public static class ApplicationServiceRegistration
    {
        public static void AddApplicationServices(this IServiceCollection services)
        {
            // AutoMapper
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            // FluentValidation (Validatorları bulur)
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // BUSINESS SERVICES (Servislerini buraya ekle!)
            // Program.cs'de kirlilik yapmasın.
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IStockService, StockService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IWarehouseService, WarehouseService>();
            services.AddScoped<ISaleService, SaleService>();
        }
    }
}