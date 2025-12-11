namespace StockTracking.Application.Interfaces.Repositories
{
    public interface IUnitOfWork : IAsyncDisposable
    {
        IProductRepository Products { get; }
        ICategoryRepository Categories { get; }
        IWarehouseRepository Warehouses { get; }
        IStockRepository Stocks { get; }
        IStockLogRepository StockLogs { get; }
        ISaleRepository Sales { get; }
        IUserRepository Users { get; }
        ITransferRepository StockTransfers { get; }
        IExpenseCategoryRepository ExpenseCategories { get; }
        IExpenseTransactionRepository ExpenseTransactions { get; }
        Task<int> SaveChangesAsync();
    }
}