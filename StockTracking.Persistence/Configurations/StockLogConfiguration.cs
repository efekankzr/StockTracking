using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class StockLogConfiguration : IEntityTypeConfiguration<StockLog>
    {
        public void Configure(EntityTypeBuilder<StockLog> builder)
        {
            builder.ToTable("StockLogs");
            builder.HasKey(sl => sl.Id);

            // İlişkiler
            // Loglar kritiktir. Ürün veya Kullanıcı silinse bile log durmalı (Restrict).

            builder.HasOne(sl => sl.Product)
                .WithMany()
                .HasForeignKey(sl => sl.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(sl => sl.Warehouse)
                .WithMany()
                .HasForeignKey(sl => sl.WarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(sl => sl.User)
                .WithMany(u => u.StockLogs)
                .HasForeignKey(sl => sl.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}