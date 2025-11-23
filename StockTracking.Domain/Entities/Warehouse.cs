using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Warehouse : BaseEntity
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string ManagerName { get; set; }

        // İlişkiler
        public ICollection<Stock> Stocks { get; set; }
    }
}