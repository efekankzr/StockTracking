using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.Property(u => u.FullName).IsRequired().HasMaxLength(100);

            builder.HasOne(u => u.Warehouse)
                   .WithMany()
                   .HasForeignKey(u => u.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);

            // --- SEED DATA (SysAdmin) ---
            // Identity'de şifre hashleme mekanizması farklıdır (PasswordHasher).
            // Manuel hash koymak yerine, program ilk çalıştığında Seed yapmak daha sağlıklıdır.
            // ANCAK, migration ile yapmak istiyorsak "Password123!" şifresinin Identity V3 Hash karşılığını koymalıyız.
            // Bu hash: "AQAAAAEAACcQAAAAELpk..." gibi uzun bir stringdir.

            var adminUser = new User
            {
                Id = 1,
                UserName = "sysadmin",
                NormalizedUserName = "SYSADMIN",
                Email = "admin@stock.com",
                NormalizedEmail = "ADMIN@STOCK.COM",
                EmailConfirmed = true,
                FullName = "System Administrator",
                PhoneNumber = "5550000000",
                IsActive = true,
                WarehouseId = null,
                SecurityStamp = Guid.NewGuid().ToString(),
                PasswordHash = "AQAAAAEAACcQAAAAEHZ5sAgY1/qj8B2+Y+1/8+7+9+0+1+2+3+4+5+6+7+8+9+0+A=="
            };
        }
    }
}