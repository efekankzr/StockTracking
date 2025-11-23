namespace StockTracking.Application.DTOs.Stock
{
    public class CreateStockEntryDto
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int Quantity { get; set; } // Eklenecek miktar (+ veya -)
        public int ProcessType { get; set; } // 1: Mal Kabul, 2: Zayi vs.
    }
}
