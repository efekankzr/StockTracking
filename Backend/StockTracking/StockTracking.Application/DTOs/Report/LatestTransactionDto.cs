namespace StockTracking.Application.DTOs.Report
{
    public class LatestTransactionDto
    {
        public int Id { get; set; }
        public string? TransactionNumber { get; set; }
        public DateTime Date { get; set; }
        public string? SalesPerson { get; set; }
        public string? Warehouse { get; set; }
        public decimal Amount { get; set; }
    }
}
