namespace StockTracking.Application.DTOs.Report
{
    public class SaleDetailDto
    {
        public int SaleId { get; set; }
        public string ProductName { get; set; }
        public string Barcode { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime Time { get; set; }
    }
}
