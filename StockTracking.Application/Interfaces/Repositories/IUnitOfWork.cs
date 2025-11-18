namespace StockTracking.Application.Interfaces.Repositories
{
    public interface IUnitOfWork : IAsyncDisposable
    {
        IProductRepository Products { get; }
        Task<int> SaveChangesAsync();
    }
}
