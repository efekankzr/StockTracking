using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Stock : BaseEntity
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int Quantity { get; set; }

        public decimal AverageCost { get; set; }
        public decimal LastPurchasePrice { get; set; }

        public Product Product { get; set; }
        public Warehouse Warehouse { get; set; }
    }
}
