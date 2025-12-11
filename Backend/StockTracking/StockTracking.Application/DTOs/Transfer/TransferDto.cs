namespace StockTracking.Application.DTOs.Transfer
{
    public class TransferDto
    {
        public int Id { get; set; }
        public string TransferNumber { get; set; }
        public string SourceWarehouseName { get; set; }
        public string TargetWarehouseName { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}