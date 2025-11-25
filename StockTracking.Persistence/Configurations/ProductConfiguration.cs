using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
            builder.Property(p => p.Barcode).IsRequired().HasMaxLength(50);

            // Barkod ile hızlı arama için indeks
            builder.HasIndex(p => p.Barcode).IsUnique();

            // PARASAL DEĞERLER (Çok Önemli!)
            // decimal(18,2) -> Toplam 18 basamak, virgülden sonra 2 basamak (Örn: 123456789.99)
            builder.Property(p => p.PurchasePrice).HasColumnType("decimal(18,2)");
            builder.Property(p => p.SalePrice).HasColumnType("decimal(18,2)");
            builder.Property(p => p.TaxRateBuying).HasColumnType("decimal(18,2)");
            builder.Property(p => p.TaxRateSelling).HasColumnType("decimal(18,2)");

            // İlişkiler
            builder.HasOne(p => p.Category)
                   .WithMany(c => c.Products)
                   .HasForeignKey(p => p.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}