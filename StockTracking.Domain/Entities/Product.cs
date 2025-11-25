using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Product : BaseEntity
    {
        public Product()
        {
            Stocks = new HashSet<Stock>();
            Sales = new HashSet<Sale>();
            StockLogs = new HashSet<StockLog>();
        }

        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Barcode { get; set; }
        public string? Image { get; set; }

        public decimal PurchasePrice { get; set; }
        public decimal SalePrice { get; set; }
        public decimal TaxRateBuying { get; set; }
        public decimal TaxRateSelling { get; set; }
        public bool IsDeleted { get; set; }

        // İlişkiler
        public Category Category { get; set; }
        public ICollection<Stock> Stocks { get; set; }

        // Bu ürünün satışları ve logları
        public ICollection<Sale> Sales { get; set; }
        public ICollection<StockLog> StockLogs { get; set; }
    }
}