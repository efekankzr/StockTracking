using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class StockTransferConfiguration : IEntityTypeConfiguration<StockTransfer>
    {
        public void Configure(EntityTypeBuilder<StockTransfer> builder)
        {
            builder.ToTable("StockTransfers");

            builder.HasOne(t => t.SourceWarehouse)
                   .WithMany()
                   .HasForeignKey(t => t.SourceWarehouseId)
                   .HasForeignKey(t => t.SourceWarehouseId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.TargetWarehouse)
                   .WithMany()
                   .HasForeignKey(t => t.TargetWarehouseId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.Product)
                   .WithMany()
                   .HasForeignKey(t => t.ProductId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}