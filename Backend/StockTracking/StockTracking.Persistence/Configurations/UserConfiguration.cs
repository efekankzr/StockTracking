using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.Property(u => u.FullName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.HasOne(u => u.Warehouse)
                   .WithMany()
                   .HasForeignKey(u => u.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
