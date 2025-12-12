using StockTracking.Application.DTOs.Expense;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface IExpenseService
    {
        Task<ServiceResponse<List<ExpenseCategoryDto>>> GetAllCategoriesAsync();
        Task<ServiceResponse<ExpenseCategoryDto>> CreateCategoryAsync(CreateExpenseCategoryDto request);
        Task<ServiceResponse<bool>> DeleteCategoryAsync(int id);
        Task<ServiceResponse<List<ExpenseTransactionDto>>> GetAllTransactionsAsync();
        Task<ServiceResponse<bool>> CreateTransactionAsync(CreateExpenseTransactionDto request, int userId);
        Task<ServiceResponse<bool>> DeleteTransactionAsync(int id);
        Task<ServiceResponse<List<ExpenseReportDto>>> GetDetailedReportAsync(DateTime startDate, DateTime endDate);
    }
}
