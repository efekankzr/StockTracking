namespace StockTracking.Application.DTOs.Report
{
    public class DashboardSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal DailyRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }

        public int TotalStockQuantity { get; set; }
        public int TotalEmployees { get; set; }


        public List<LatestTransactionDto> LatestSales { get; set; }
    }
}
