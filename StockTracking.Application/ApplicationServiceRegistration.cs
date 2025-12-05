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
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IStockService, StockService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IWarehouseService, WarehouseService>();
            services.AddScoped<ISaleService, SaleService>();
            services.AddScoped<ITransferService, TransferService>();
            services.AddScoped<IExpenseService, ExpenseService>();
        }
    }
}