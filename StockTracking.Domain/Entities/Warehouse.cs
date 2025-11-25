using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Warehouse : BaseEntity
    {
        public Warehouse()
        {
            Stocks = new HashSet<Stock>();
            Sales = new HashSet<Sale>();      // <--- EKLENDİ
            StockLogs = new HashSet<StockLog>(); // <--- EKLENDİ
        }

        public string Name { get; set; }
        public string Address { get; set; }
        public string ManagerName { get; set; }

        // İlişkiler
        public ICollection<Stock> Stocks { get; set; }
        public ICollection<Sale> Sales { get; set; } // Bu deponun satışları
        public ICollection<StockLog> StockLogs { get; set; } // Bu deponun hareketleri
    }
}