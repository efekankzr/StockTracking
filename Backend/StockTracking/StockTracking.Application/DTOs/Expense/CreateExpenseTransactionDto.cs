namespace StockTracking.Application.DTOs.Expense
{
    public class CreateExpenseTransactionDto
    {
        public int ExpenseCategoryId { get; set; }
        public int WarehouseId { get; set; }
        public string? DocumentNumber { get; set; }
        public DateTime DocumentDate { get; set; }
        public decimal TotalAmount { get; set; } 
        public decimal Amount { get; set; } // Compatibility check
        public string? Description { get; set; }
        
        public decimal? VatRate { get; set; }
        public decimal? WithholdingRate { get; set; }
        public bool IsVatIncluded { get; set; } // Added based on error
    }
}
