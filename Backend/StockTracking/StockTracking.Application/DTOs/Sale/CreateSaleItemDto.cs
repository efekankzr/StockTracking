namespace StockTracking.Application.DTOs.Sale
{
    public class CreateSaleItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }

        public decimal? UnitPrice { get; set; }
    }
}
