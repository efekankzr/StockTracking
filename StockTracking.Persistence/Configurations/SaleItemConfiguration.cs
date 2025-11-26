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

            builder.Property(i => i.UnitPriceWithVat).HasColumnType("decimal(18,2)");
            builder.Property(i => i.VatRate).HasColumnType("decimal(18,2)");
            builder.Property(i => i.VatAmountTotal).HasColumnType("decimal(18,2)");
            builder.Property(i => i.LineTotal).HasColumnType("decimal(18,2)");

            builder.HasOne(i => i.Product)
                   .WithMany()
                   .HasForeignKey(i => i.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}