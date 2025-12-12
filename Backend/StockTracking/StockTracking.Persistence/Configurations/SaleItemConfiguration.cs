using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class SaleItemConfiguration : IEntityTypeConfiguration<SaleItem>
    {
        public void Configure(EntityTypeBuilder<SaleItem> builder)
        {
            builder.ToTable("SaleItems");

            builder.Property(i => i.UnitCost).HasColumnType("decimal(18,4)");
            builder.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
            builder.Property(i => i.VatRate).HasColumnType("decimal(18,2)");
            builder.Property(i => i.VatAmount).HasColumnType("decimal(18,2)");

            builder.HasOne(i => i.Product)
                   .WithMany(p => p.SaleItems)
                   .HasForeignKey(i => i.ProductId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
