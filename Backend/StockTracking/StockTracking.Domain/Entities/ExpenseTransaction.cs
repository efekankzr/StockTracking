using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class ExpenseTransaction : BaseEntity
    {
        public int ExpenseCategoryId { get; set; }
        public ExpenseCategory? ExpenseCategory { get; set; }

        public int WarehouseId { get; set; }
        public Warehouse? Warehouse { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public string? DocumentNumber { get; set; }
        public DateTime DocumentDate { get; set; }

        public decimal Amount { get; set; }
        public decimal VatAmount { get; set; }
        public decimal WithholdingAmount { get; set; }

        public string? Description { get; set; }

        public bool IsVatIncludedEntry { get; set; }
    }
}
