namespace StockTracking.Application.DTOs.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Name { get; set; }
        public string Barcode { get; set; }
        public string? Image { get; set; }

        public decimal SalePrice { get; set; }
        public decimal TaxRateSelling { get; set; }
        public bool IsActive { get; set; }
    }
}