using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }

        // İlişkiler
        public ICollection<Product> Products { get; set; }
    }
}