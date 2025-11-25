using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("Categories"); // Tablo adı

            builder.HasKey(c => c.Id); // PK

            builder.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(100); // NVARCHAR(100)

            builder.Property(c => c.Description)
                .HasMaxLength(500);

            // İlişkiler
            builder.HasMany(c => c.Products)
                   .WithOne(p => p.Category)
                   .HasForeignKey(p => p.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict); // Kategori silinirse ürünleri silme, hata ver.
        }
    }
}