using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Stock : BaseEntity
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int Quantity { get; set; }

        // İlişkiler
        public Product Product { get; set; }
        public Warehouse Warehouse { get; set; }
    }
}