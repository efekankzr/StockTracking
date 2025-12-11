using StockTracking.Domain.Entities.Common;
using StockTracking.Domain.Enums;

namespace StockTracking.Domain.Entities
{
    public class Sale : BaseEntity
    {
        public Sale()
        {
            SaleItems = new HashSet<SaleItem>();
        }

        public string TransactionNumber { get; set; }
        public DateTime TransactionDate { get; set; }

        public int UserId { get; set; }
        public int? ActualSalesPersonId { get; set; }

        public int WarehouseId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal TotalVatAmount { get; set; }

        public User User { get; set; }
        public User? ActualSalesPerson { get; set; }
        public Warehouse Warehouse { get; set; }
        public ICollection<SaleItem> SaleItems { get; set; }
    }
}