namespace StockTracking.Application.DTOs.StockLog
{
    public class StockLogDto
    {
        public int Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? ProductName { get; set; }
        public string? WarehouseName { get; set; }
        public string? UserName { get; set; }
        public string? ProcessType { get; set; }
        public int ChangeAmount { get; set; }
    }
}
