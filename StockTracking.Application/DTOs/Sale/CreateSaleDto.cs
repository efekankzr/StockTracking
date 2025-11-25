using StockTracking.Domain.Enums;

namespace StockTracking.Application.DTOs.Sale
{
    public class CreateSaleDto
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; } // Zorunlu alan
        public int Quantity { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
    }
}