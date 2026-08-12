using AssignmentDesk.Application.Interfaces.IRepository.Common;
using AssignmentDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Infrastructure.Repositories.Common
{
    public class Repository<T> : BaseRepository<T>, IRepository<T>
           where T : class
    {
        public Repository(ApplicationDbContext context) : base(context) { }

        // 🔍 Get by Id
        public async Task<T?> GetByIdAsync(
            int id,
            Func<IQueryable<T>, IQueryable<T>>? include = null)
        {
            IQueryable<T> query = _dbSet;

            if (include != null)
            {
                query = include(query);
            }

            // EF.Property দিয়ে সহজে আইডি ধরে ফিল্টার করা
            return await query.FirstOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
        }

        // 📋 Get All
        public async Task<List<T>> GetAllAsync(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IQueryable<T>>? include = null,
            bool asNoTracking = true)
        {
            IQueryable<T> query = _dbSet;

            if (asNoTracking)
                query = query.AsNoTracking();

            // 🔥 APPLY FILTER
            if (filter != null)
                query = query.Where(filter);

            // 🔥 APPLY INCLUDE
            if (include != null)
                query = include(query);

            return await query.ToListAsync();
        }

        // 🔍 Filtered Get
        public async Task<List<T>> GetAsync(
            System.Linq.Expressions.Expression<Func<T, bool>> filter,
            Func<IQueryable<T>, IQueryable<T>>? include = null)
        {
            IQueryable<T> query = _dbSet;

            if (include != null)
                query = include(query);

            return await query.Where(filter).ToListAsync();
        }

        // 📄 Pagination
        public async Task<(List<T> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            System.Linq.Expressions.Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IQueryable<T>>? include = null)
        {
            IQueryable<T> query = _dbSet;

            if (include != null)
                query = include(query);

            if (predicate != null)
                query = query.Where(predicate);

            int totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        // ➕ Add
        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        // ➕ Add Range
        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        // ✏️ Update
        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }

        // ❌ Delete
        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }
    }
}
