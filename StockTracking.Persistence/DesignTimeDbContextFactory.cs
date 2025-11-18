using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using StockTracking.Persistence.Context;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<StockDbContext>
{
    public StockDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<StockDbContext>();

        // !!! Buraya senin Connection String gelecek !!!
        optionsBuilder.UseSqlServer(
            "Server=localhost;Database=StockTrackingDb;Trusted_Connection=True;TrustServerCertificate=True"
        );

        return new StockDbContext(optionsBuilder.Options);
    }
}
