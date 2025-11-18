namespace StockTracking.Application.DTOs.Product
{
    public class CreateProductDto
    {
        public string Name { get; set; } = null!;
        public string Barcode { get; set; } = null!;
    }
}
