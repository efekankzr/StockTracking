using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Product : BaseEntity
    {
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Barcode { get; set; }
        public string? Image { get; set; }

        // Attribute kullanmıyoruz, Persistence katmanında ayarlayacağız.
        public decimal PurchasePrice { get; set; }
        public decimal SalePrice { get; set; }
        public decimal TaxRateBuying { get; set; }
        public decimal TaxRateSelling { get; set; }
        public bool IsDeleted { get; set; }

        public Category Category { get; set; }
        public ICollection<Stock> Stocks { get; set; }
    }
}