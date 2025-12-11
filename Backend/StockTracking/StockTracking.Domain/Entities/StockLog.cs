using StockTracking.Domain.Entities.Common;
using StockTracking.Domain.Enums;

namespace StockTracking.Domain.Entities
{
    public class StockLog : BaseEntity
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int ChangeAmount { get; set; }
        public ProcessType ProcessType { get; set; }

        public decimal? InboundPrice { get; set; }
        public decimal? InboundTaxRate { get; set; }

        public int CreatedByUserId { get; set; }
        public int? RelatedSaleId { get; set; }

        public Product Product { get; set; }
        public Warehouse Warehouse { get; set; }
        public User User { get; set; }
        public Sale? RelatedSale { get; set; }
    }
}