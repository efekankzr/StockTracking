using StockTracking.Domain.Entities;

namespace StockTracking.Application.Interfaces.Repositories
{
    public interface IExpenseTransactionRepository : IGenericRepository<ExpenseTransaction>
    {
        // Giderleri çekerken Kategori, Depo ve Personel adlarýný da getirmek için
        Task<List<ExpenseTransaction>> GetAllWithDetailsAsync();
    }
}
