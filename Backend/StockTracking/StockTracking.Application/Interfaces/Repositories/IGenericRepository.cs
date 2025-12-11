using StockTracking.Domain.Entities.Common;
using System.Linq.Expressions;

namespace StockTracking.Application.Interfaces.Repositories
{
    public interface IGenericRepository<T> where T : class, IEntity, new()
    {
        Task<T?> GetByIdAsync(int id);
        Task<IReadOnlyList<T>> GetAllAsync();
        Task<IReadOnlyList<T>> GetWhereAsync(Expression<Func<T, bool>> predicate);
        Task<T?> GetSingleAsync(Expression<Func<T, bool>> predicate);
        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        void Update(T entity);
        void Delete(T entity);
        Task DeleteAsync(int id);
        void HardDelete(T entity);
        Task HardDeleteAsync(int id);
        Task ArchiveAsync(int id);
        Task RestoreAsync(int id);
        Task<int> SaveChangesAsync();
    }
}