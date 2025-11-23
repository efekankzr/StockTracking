using Microsoft.EntityFrameworkCore;
using StockTracking.Domain.Entities;

namespace StockTracking.Persistence.Context;

public class StockDbContext : DbContext
{
    public StockDbContext(DbContextOptions<StockDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<Stock> Stocks { get; set; }
    public DbSet<StockLog> StockLogs { get; set; }
    public DbSet<Sale> Sales { get; set; }
    public DbSet<User> Users { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(StockDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
