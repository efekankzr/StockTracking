namespace StockTracking.Application.DTOs.Transfer
{
    public class CreateTransferDto
    {
        public int SourceWarehouseId { get; set; }
        public int TargetWarehouseId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
