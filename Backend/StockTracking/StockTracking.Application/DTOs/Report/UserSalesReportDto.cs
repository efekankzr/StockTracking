namespace StockTracking.Application.DTOs.Report
{
    public class UserSalesReportDto
    {
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? Role { get; set; }

        public int TotalQuantity { get; set; }
        public decimal TotalAmount { get; set; }

        public decimal TotalCost { get; set; }
        public decimal TotalProfit { get; set; }
        public decimal ProfitMargin { get; set; }

        public List<SaleDetailDto> Sales { get; set; }
    }    
}
