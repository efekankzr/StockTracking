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

            builder.Property(w => w.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(w => w.ManagerName)
                .HasMaxLength(100);
        }
    }
}