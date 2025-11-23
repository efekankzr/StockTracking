using Microsoft.EntityFrameworkCore;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Domain.Entities.Common;
using StockTracking.Persistence.Context;
using System.Linq.Expressions;

namespace StockTracking.Persistence.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        private readonly StockDbContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(StockDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IReadOnlyList<T>> GetAllAsync()
        {
            return await _dbSet.AsNoTracking().ToListAsync();
        }

        public async Task<IReadOnlyList<T>> GetWhereAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).AsNoTracking().ToListAsync();
        }

        public async Task<T?> GetSingleAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public void Update(T entity)
        {
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void Delete(T entity)
        {
            if (_context.Entry(entity).State == EntityState.Detached)
            {
                _dbSet.Attach(entity);
            }
            _dbSet.Remove(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
                Delete(entity);
        }

        public async Task<int> SaveChangesAsync()
        {
            // Genelde UoW üzerinden save yaparız ama repo üzerinden çağrılırsa diye:
            return await _context.SaveChangesAsync();
        }
    }
}