using System.Linq.Expressions;
using StockTracking.Domain.Entities.Common;

namespace StockTracking.Application.Interfaces.Repositories
{
    public interface IGenericRepository<T> where T : BaseEntity
    {
        Task<T?> GetByIdAsync(int id);
        Task<IReadOnlyList<T>> GetAllAsync();
        Task<IReadOnlyList<T>> GetWhereAsync(Expression<Func<T, bool>> predicate);

        // İlişkili verileri de getirmek istersen (Include)
        Task<T?> GetSingleAsync(Expression<Func<T, bool>> predicate);

        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);

        void Update(T entity);
        void Delete(T entity);
        Task DeleteAsync(int id); // ID ile silme kolaylığı için

        // UnitOfWork kullanacağımız için buradaki Save'i genelde kullanmayız ama interface'de istediğin için dursun.
        Task<int> SaveChangesAsync();
    }
}