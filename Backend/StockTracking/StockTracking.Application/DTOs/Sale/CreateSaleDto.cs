using StockTracking.Application.DTOs.Sale;

namespace StockTracking.Application.DTOs.Sale
{
    public class CreateSaleDto
    {
        public int WarehouseId { get; set; }
        public List<CreateSaleItemDto> Items { get; set; } = new();
        public string? Description { get; set; }
        
        public int PaymentMethod { get; set; } // Added based on error
        public int? ActualSalesPersonId { get; set; } // Added based on error
    }
}
