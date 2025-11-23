using StockTracking.Domain.Entities.Common;
using StockTracking.Domain.Enums;

namespace StockTracking.Domain.Entities
{
    public class Sale : BaseEntity
    {
        public DateTime TransactionDate { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public PaymentMethod PaymentMethod { get; set; }

        // Snapshot Alanları
        public decimal SnapshotPurchasePrice { get; set; }
        public decimal SnapshotSalePrice { get; set; }
        public decimal SnapshotTaxBuying { get; set; }
        public decimal SnapshotTaxSelling { get; set; }

        public User User { get; set; }
        public Product Product { get; set; }
    }
}