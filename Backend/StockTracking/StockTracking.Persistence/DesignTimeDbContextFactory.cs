using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using StockTracking.Persistence.Context;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<StockTrackingDbContext>
{
    public StockTrackingDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<StockTrackingDbContext>();

        optionsBuilder.UseSqlServer(
            "Server=localhost;Database=StockTrackingDb;Trusted_Connection=True;TrustServerCertificate=True"
        );

        return new StockTrackingDbContext(optionsBuilder.Options);
    }
}
