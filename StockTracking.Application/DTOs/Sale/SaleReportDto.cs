namespace StockTracking.Application.DTOs.Sale
{
    public class SaleReportDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string ProductName { get; set; }
        public string SalesPersonName { get; set; } // Satan kişi
        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; } // Satış anındaki fiyat
        public decimal TotalPrice { get; set; } // Quantity * UnitPrice

        public string PaymentMethod { get; set; }
    }
}
