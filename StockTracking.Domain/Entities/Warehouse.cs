using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Warehouse : BaseEntity
    {
        public Warehouse()
        {
            Stocks = new HashSet<Stock>();
            Sales = new HashSet<Sale>();
            StockLogs = new HashSet<StockLog>();
        }

        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public ICollection<Stock> Stocks { get; set; }
        public ICollection<Sale> Sales { get; set; }
        public ICollection<StockLog> StockLogs { get; set; }
    }
}