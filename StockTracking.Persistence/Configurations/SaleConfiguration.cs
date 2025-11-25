using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class SaleConfiguration : IEntityTypeConfiguration<Sale>
    {
        public void Configure(EntityTypeBuilder<Sale> builder)
        {
            builder.ToTable("Sales");
            builder.HasKey(s => s.Id);

            // Snapshot Parasal Değerler
            builder.Property(s => s.SnapshotPurchasePrice).HasColumnType("decimal(18,2)");
            builder.Property(s => s.SnapshotSalePrice).HasColumnType("decimal(18,2)");
            builder.Property(s => s.SnapshotTaxBuying).HasColumnType("decimal(18,2)");
            builder.Property(s => s.SnapshotTaxSelling).HasColumnType("decimal(18,2)");

            // İlişkiler (DeleteBehavior.Restrict KRİTİKTİR)
            // Ürün veya Kullanıcı silinse bile satış geçmişi RAPORLAR İÇİN KALMALIDIR.

            builder.HasOne(s => s.User)
                   .WithMany(u => u.Sales)
                   .HasForeignKey(s => s.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Product)
                   .WithMany(p => p.Sales)
                   .HasForeignKey(s => s.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Warehouse)
                   .WithMany(w => w.Sales)
                   .HasForeignKey(s => s.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}