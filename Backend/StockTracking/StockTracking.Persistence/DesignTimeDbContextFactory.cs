using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using StockTracking.Persistence.Context;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<StockTrackingDbContext>
{
    public StockTrackingDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<StockTrackingDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Database=StockTrackingDb;Username=postgres;Password=your_password"
        );

        return new StockTrackingDbContext(optionsBuilder.Options);
    }
}
