using Microsoft.AspNetCore.Identity;
using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class User : IdentityUser<int>, IEntity
    {
        public User()
        {
            Sales = new HashSet<Sale>();
            StockLogs = new HashSet<StockLog>();
        }

        public string FullName { get; set; }
        public bool IsActive { get; set; } = true;

        public int? WarehouseId { get; set; }
        public Warehouse? Warehouse { get; set; }

        public ICollection<Sale> Sales { get; set; }
        public ICollection<StockLog> StockLogs { get; set; }
    }
}
