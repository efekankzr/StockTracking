namespace StockTracking.Application.DTOs.Product
{
    public class ProductListDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Barcode { get; set; }
        public string? CategoryName { get; set; }
        public decimal SalePrice { get; set; }
        public int TotalStockQuantity { get; set; }
        public bool IsActive { get; set; }
    }
}
