using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;

namespace StockTracking.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");
            builder.HasKey(u => u.Id);

            builder.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            builder.Property(u => u.Username).IsRequired().HasMaxLength(50);
            builder.Property(u => u.Email).IsRequired().HasMaxLength(100);
            builder.Property(u => u.PhoneNumber).HasMaxLength(20);

            builder.HasIndex(u => u.Username).IsUnique();
            builder.HasIndex(u => u.Email).IsUnique();

            builder.HasOne(u => u.Warehouse)
                   .WithMany()
                   .HasForeignKey(u => u.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);

            // --- DATA SEEDING (İlk Admin) ---
            // Şifre: "Password123!" (SHA256 Hash hali)
            // Gerçek projelerde hashleme servisi kullanılır ama seed için buraya hardcoded hash koyuyoruz.
            // Aşağıdaki hash "Password123!" şifresinin SHA256 karşılığıdır.

            var adminUser = new User
            {
                Id = 1,
                FullName = "System Administrator",
                Username = "sysadmin",
                Email = "admin@stock.com",
                PhoneNumber = "5550000000",
                Role = UserRole.Admin,
                IsActive = true,
                WarehouseId = null, // Admin bağımsızdır
                CreatedDate = new DateTime(2025, 1, 1),
                PasswordHash = "5b722b307fce6c9789665bc67eb7279794650e4249158c28137d476227727371"
            };

            builder.HasData(adminUser);
        }
    }
}