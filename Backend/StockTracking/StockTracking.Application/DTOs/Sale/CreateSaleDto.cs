using StockTracking.Domain.Enums;

namespace StockTracking.Application.DTOs.Sale
{
    public class CreateSaleDto
    {
        public int WarehouseId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }

        public int? ActualSalesPersonId { get; set; }

        public List<CreateSaleItemDto> Items { get; set; }
    }
}
