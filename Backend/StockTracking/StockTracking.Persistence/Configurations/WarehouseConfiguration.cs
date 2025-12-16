using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
    {
        public void Configure(EntityTypeBuilder<Warehouse> builder)
        {
            builder.ToTable("Warehouses");
            builder.HasKey(w => w.Id);

            builder.Property(w => w.Name).IsRequired().HasMaxLength(100);
            builder.Property(w => w.NormalizedName).IsRequired().HasMaxLength(150);
            builder.HasIndex(w => w.NormalizedName).IsUnique();

            builder.Property(w => w.Address).IsRequired().HasMaxLength(500);

            builder.Property(w => w.City).IsRequired().HasMaxLength(50);
            builder.Property(w => w.District).IsRequired().HasMaxLength(50);



            builder.HasMany(w => w.Stocks)
                   .WithOne(s => s.Warehouse)
                   .HasForeignKey(s => s.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
