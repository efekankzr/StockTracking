using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class StockConfiguration : IEntityTypeConfiguration<Stock>
    {
        public void Configure(EntityTypeBuilder<Stock> builder)
        {
            builder.ToTable("Stocks");
            builder.HasKey(s => s.Id);

            // Stok miktarı eksiye düşmemeli (İş kuralı opsiyonel, veritabanında kısıtlamak istersen)
            // builder.ToTable(t => t.HasCheckConstraint("CK_Stock_Quantity", "[Quantity] >= 0")); 

            // İlişkiler
            builder.HasOne(s => s.Product)
                .WithMany(p => p.Stocks)
                .HasForeignKey(s => s.ProductId);

            builder.HasOne(s => s.Warehouse)
                .WithMany(w => w.Stocks)
                .HasForeignKey(s => s.WarehouseId);
        }
    }
}