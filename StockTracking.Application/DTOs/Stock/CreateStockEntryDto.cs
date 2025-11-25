using StockTracking.Domain.Enums;

namespace StockTracking.Application.DTOs.Stock
{
    public class CreateStockEntryDto
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int Quantity { get; set; } // Adet (Pozitif girilir)
        public ProcessType ProcessType { get; set; } // 2: MalKabul, 4: Zayi
        public string? Description { get; set; }
    }
}