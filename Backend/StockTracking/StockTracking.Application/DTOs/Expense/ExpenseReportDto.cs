namespace StockTracking.Application.DTOs.Expense
{
    public class ExpenseReportDto
    {
        public string CategoryName { get; set; }
        public int TransactionCount { get; set; }
        public decimal TotalAmount { get; set; }     // Kasa Çıkışı (Toplam)
        public decimal TotalVat { get; set; }        // Ödenen KDV
        public decimal TotalWithholding { get; set; } // Ödenen Stopaj
        public decimal TotalBaseAmount { get; set; } // Matrah
    }
}
