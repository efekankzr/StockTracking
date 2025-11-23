using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            // Tablo Adı (İsteğe bağlı)
            builder.ToTable("Products");

            // Primary Key
            builder.HasKey(x => x.Id);

            // Property Ayarları
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Barcode).HasMaxLength(50);

            // MSSQL için Decimal Hassasiyeti (Para birimleri için kritik)
            builder.Property(x => x.PurchasePrice).HasColumnType("decimal(18,2)");
            builder.Property(x => x.SalePrice).HasColumnType("decimal(18,2)");
            builder.Property(x => x.TaxRateBuying).HasColumnType("decimal(18,2)");
            builder.Property(x => x.TaxRateSelling).HasColumnType("decimal(18,2)");

            // İlişkiler
            builder.HasOne(x => x.Category)
                   .WithMany(c => c.Products)
                   .HasForeignKey(x => x.CategoryId);
        }
    }
}