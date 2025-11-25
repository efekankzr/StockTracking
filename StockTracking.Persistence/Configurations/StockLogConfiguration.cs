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

            // İlişkiler
            builder.HasOne(l => l.Product)
                   .WithMany(p => p.StockLogs)
                   .HasForeignKey(l => l.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.Warehouse)
                   .WithMany(w => w.StockLogs)
                   .HasForeignKey(l => l.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.User)
                   .WithMany(u => u.StockLogs)
                   .HasForeignKey(l => l.CreatedByUserId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Opsiyonel ilişki: Sale
            builder.HasOne(l => l.RelatedSale)
                   .WithMany() // Sale tarafında Log koleksiyonu tanımlamadık, gerek yok.
                   .HasForeignKey(l => l.RelatedSaleId)
                   .OnDelete(DeleteBehavior.SetNull); // Satış silinirse log kalsın ama ID null olsun.
        }
    }
}