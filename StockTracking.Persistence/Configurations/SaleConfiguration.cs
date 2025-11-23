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

            // SNAPSHOT Fiyat Alanları (Decimal Hassasiyeti Önemli)
            builder.Property(s => s.SnapshotPurchasePrice).HasColumnType("decimal(18,2)");
            builder.Property(s => s.SnapshotSalePrice).HasColumnType("decimal(18,2)");
            builder.Property(s => s.SnapshotTaxBuying).HasColumnType("decimal(18,2)");
            builder.Property(s => s.SnapshotTaxSelling).HasColumnType("decimal(18,2)");

            // İlişkiler
            builder.HasOne(s => s.User)
                .WithMany(u => u.Sales)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Kullanıcı silinirse satış kayıtları silinmesin!

            builder.HasOne(s => s.Product)
                .WithMany() // Product tarafında "Sales" koleksiyonu tanımlamadıysak boş bırakırız
                .HasForeignKey(s => s.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}