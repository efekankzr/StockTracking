using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class StockLogConfiguration : IEntityTypeConfiguration<StockLog>
    {
        public void Configure(EntityTypeBuilder<StockLog> builder)
        {
            builder.ToTable("StockLogs");
            builder.HasKey(l => l.Id);

            // Ýliþkiler
            builder.HasOne(l => l.Product)
                   .WithMany(p => p.StockLogs)
                   .HasForeignKey(l => l.ProductId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.Warehouse)
                   .WithMany(w => w.StockLogs)
                   .HasForeignKey(l => l.WarehouseId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.User)
                   .WithMany(u => u.StockLogs)
                   .HasForeignKey(l => l.CreatedByUserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.RelatedSale)
                   .WithMany()
                   .HasForeignKey(l => l.RelatedSaleId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.Property(sl => sl.InboundPrice).HasColumnType("decimal(18,2)");
            builder.Property(sl => sl.InboundTaxRate).HasColumnType("decimal(18,2)");
        }
    }
}
