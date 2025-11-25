using StockTracking.Domain.Entities.Common;
using StockTracking.Domain.Enums;

namespace StockTracking.Domain.Entities
{
    public class User : BaseEntity
    {
        public User()
        {
            Sales = new HashSet<Sale>();
            StockLogs = new HashSet<StockLog>();
        }

        public string FullName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; } = true;

        public int? WarehouseId { get; set; }
        public Warehouse? Warehouse { get; set; }

        public ICollection<Sale> Sales { get; set; }
        public ICollection<StockLog> StockLogs { get; set; }
    }
}