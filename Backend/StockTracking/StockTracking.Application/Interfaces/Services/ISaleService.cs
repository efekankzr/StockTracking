using StockTracking.Application.DTOs.Report;
using StockTracking.Application.DTOs.Sale;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface ISaleService
    {
        Task<ServiceResponse<List<SaleDto>>> GetAllSalesAsync();
        Task<ServiceResponse<SaleDto>> CreateSaleAsync(CreateSaleDto request, int userId);
        Task<ServiceResponse<List<UserSalesReportDto>>> GetDailyReportAsync(DateTime date);
        Task<ServiceResponse<DashboardSummaryDto>> GetDashboardSummaryAsync();
    }
}
