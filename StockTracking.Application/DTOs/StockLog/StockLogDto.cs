namespace StockTracking.Application.DTOs.StockLog
{
    public class StockLogDto
    {
        public DateTime Date { get; set; }
        public string ProductName { get; set; }
        public string WarehouseName { get; set; }
        public string ProcessType { get; set; } // "Satış", "İade" vs.
        public int ChangeAmount { get; set; } // +5, -3
        public string UserName { get; set; } // İşlemi yapan
    }
}
