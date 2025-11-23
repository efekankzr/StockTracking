using StockTracking.Domain.Entities.Common;
using StockTracking.Domain.Enums; // ProcessType buradan gelecek

namespace StockTracking.Domain.Entities
{
    public class StockLog : BaseEntity
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int ChangeAmount { get; set; } // +5, -10 vb.
        public ProcessType ProcessType { get; set; } // Enum

        public int CreatedByUserId { get; set; }
        public int? RelatedSaleId { get; set; } // Opsiyonel

        // İlişkiler
        public Product Product { get; set; }
        public Warehouse Warehouse { get; set; }
        public User User { get; set; } // İşlemi yapan
    }
}