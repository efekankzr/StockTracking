namespace StockTracking.Application.DTOs.StockLog
{
    public class StockLogDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }

        public string ProductName { get; set; }
        public string WarehouseName { get; set; }
        public string UserName { get; set; } // İşlemi yapan

        public string ProcessType { get; set; } // "Satış", "Mal Kabul"
        public int ChangeAmount { get; set; } // +10, -5
    }
}
