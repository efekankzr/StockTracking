namespace StockTracking.Application.DTOs.Expense
{
    public class ExpenseTransactionDto
    {
        public int Id { get; set; }
        public string? CategoryName { get; set; }
        public string? WarehouseName { get; set; }
        public string? UserName { get; set; }

        public string? DocumentNumber { get; set; }
        public DateTime DocumentDate { get; set; }
        public string? Description { get; set; }

        public decimal BaseAmount { get; set; }
        public decimal VatAmount { get; set; }
        public decimal WithholdingAmount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
