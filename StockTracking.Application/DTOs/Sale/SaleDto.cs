namespace StockTracking.Application.DTOs.Sale
{
    public class SaleDto
    {
        public int Id { get; set; }
        public string TransactionNumber { get; set; }
        public DateTime TransactionDate { get; set; }

        public string WarehouseName { get; set; }
        public string SalesPerson { get; set; }
        public string PaymentMethod { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal TotalVatAmount { get; set; }

        public List<SaleItemDto> SaleItems { get; set; }
    }
}