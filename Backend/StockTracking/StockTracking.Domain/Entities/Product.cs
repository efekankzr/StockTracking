using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Product : BaseEntity, ISoftDelete
    {
        public Product()
        {
            Stocks = new HashSet<Stock>();
            SaleItems = new HashSet<SaleItem>();
            StockLogs = new HashSet<StockLog>();
        }

        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string NormalizedName { get; set; }
        public string Barcode { get; set; }
        public string? Image { get; set; }

        public decimal SalePrice { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public Category Category { get; set; }
        public ICollection<Stock> Stocks { get; set; }
        public ICollection<SaleItem> SaleItems { get; set; }
        public ICollection<StockLog> StockLogs { get; set; }
    }
}
