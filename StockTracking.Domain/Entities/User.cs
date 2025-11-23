using StockTracking.Domain.Entities.Common;
using StockTracking.Domain.Enums;

namespace StockTracking.Domain.Entities
{
    public class User : BaseEntity
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }

        // Navigation Properties
        public ICollection<Sale> Sales { get; set; }
        public ICollection<StockLog> StockLogs { get; set; }
    }
}