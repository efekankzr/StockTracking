using StockTracking.Domain.Entities.Common;
using StockTracking.Domain.Enums;

namespace StockTracking.Domain.Entities
{
    public class StockTransfer : BaseEntity
    {
        public string TransferNumber { get; set; }

        public int SourceWarehouseId { get; set; }
        public int TargetWarehouseId { get; set; }

        public int ProductId { get; set; }
        public int Quantity { get; set; }

        public TransferStatus Status { get; set; }

        public int CreatedByUserId { get; set; }
        public int? ApprovedByUserId { get; set; }
        public DateTime? ApprovedDate { get; set; }

        public Warehouse SourceWarehouse { get; set; }
        public Warehouse TargetWarehouse { get; set; }
        public Product Product { get; set; }
        public User CreatedByUser { get; set; }
    }
}