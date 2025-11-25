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

            builder.Property(w => w.Address)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(w => w.ManagerName)
                .HasMaxLength(100);

            // İlişkiler: Depo silinirse içindeki stoklar silinmesin (Güvenlik)
            builder.HasMany(w => w.Stocks)
                   .WithOne(s => s.Warehouse)
                   .HasForeignKey(s => s.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}