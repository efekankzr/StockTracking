using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Configurations
{
    public class ExpenseTransactionConfiguration : IEntityTypeConfiguration<ExpenseTransaction>
    {
        public void Configure(EntityTypeBuilder<ExpenseTransaction> builder)
        {
            builder.ToTable("ExpenseTransactions");
            builder.HasKey(t => t.Id);

            builder.Property(t => t.DocumentNumber).IsRequired().HasMaxLength(50);
            builder.Property(t => t.Description).HasMaxLength(500);

            // --- FÝNANSAL HASSASÝYET ---
            builder.Property(t => t.BaseAmount).HasColumnType("decimal(18,4)");
            builder.Property(t => t.VatAmount).HasColumnType("decimal(18,4)");
            builder.Property(t => t.WithholdingAmount).HasColumnType("decimal(18,4)");
            builder.Property(t => t.TotalAmount).HasColumnType("decimal(18,4)");

            // --- ÝLÝÞKÝLER ---

            // Kategori silinirse, geçmiþ gider kayýtlarý silinmesin (Restrict)
            builder.HasOne(t => t.ExpenseCategory)
                   .WithMany(c => c.Transactions)
                   .HasForeignKey(t => t.ExpenseCategoryId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            // Depo silinirse, o depoya ait giderler durmalý (Rapor için)
            builder.HasOne(t => t.Warehouse)
                   .WithMany() // Warehouse tarafýnda liste tutmuyoruz
                   .HasForeignKey(t => t.WarehouseId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Restrict);

            // Personel silinirse, kaydý giren kiþi null olmasýn (Restrict)
            builder.HasOne(t => t.User)
                   .WithMany()
                   .HasForeignKey(t => t.UserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
