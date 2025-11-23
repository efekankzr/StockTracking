namespace StockTracking.Application.DTOs.Stock
{
    public class StockDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; }
        public int Quantity { get; set; }
    }
}
