using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using StockTracking.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace StockTracking.WebAPI
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

            string[] roles = { "Admin", "DepoSorumlusu", "SatisPersoneli" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole<int>(role));
                }
            }

            if (await userManager.FindByNameAsync("sysadmin") == null)
            {
                var admin = new User
                {
                    UserName = "sysadmin",
                    Email = "admin@stock.com",
                    FullName = "System Administrator",
                    PhoneNumber = "5550000000",
                    IsActive = true,
                    WarehouseId = null
                };

                var result = await userManager.CreateAsync(admin, "Password123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
        }
    }
}