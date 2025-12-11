using StockTracking.Domain.Enums;

namespace StockTracking.Application.DTOs.Stock
{
    public class CreateStockEntryDto
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int Quantity { get; set; }
        public ProcessType ProcessType { get; set; }
        public string? Description { get; set; }

        public decimal? UnitPrice { get; set; }
        public decimal? TaxRate { get; set; }
    }
}