using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class SaleItem : BaseEntity
    {
        public int SaleId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }

        public decimal UnitPriceWithVat { get; set; }
        public decimal VatRate { get; set; }
        public decimal VatAmountTotal { get; set; }
        public decimal LineTotal { get; set; }

        public Sale Sale { get; set; }
        public Product Product { get; set; }
    }
}