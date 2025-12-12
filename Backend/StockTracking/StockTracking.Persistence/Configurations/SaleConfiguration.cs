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

            builder.Property(s => s.TotalAmount).HasColumnType("decimal(18,2)");
            builder.Property(s => s.TotalVatAmount).HasColumnType("decimal(18,2)");
            builder.Property(s => s.TransactionNumber).HasMaxLength(50);

            builder.HasOne(s => s.User)
                   .WithMany(u => u.Sales)
                   .HasForeignKey(s => s.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.ActualSalesPerson)
                   .WithMany()
                   .HasForeignKey(s => s.ActualSalesPersonId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Warehouse)
                   .WithMany(w => w.Sales)
                   .HasForeignKey(s => s.WarehouseId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.SaleItems)
                   .WithOne(i => i.Sale)
                   .HasForeignKey(i => i.SaleId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}