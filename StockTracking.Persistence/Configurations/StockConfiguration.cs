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

            // UNIQUE CONSTRAINT: 
            // Bir depoda aynı üründen iki satır olamaz. 
            // (Örn: A Deposu'nda Kalem ürünü tek satırda toplanmalı, iki ayrı satır olmamalı)
            builder.HasIndex(s => new { s.ProductId, s.WarehouseId }).IsUnique();

            // İlişkiler
            builder.HasOne(s => s.Product)
                   .WithMany(p => p.Stocks)
                   .HasForeignKey(s => s.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Warehouse)
                   .WithMany(w => w.Stocks)
                   .HasForeignKey(s => s.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}