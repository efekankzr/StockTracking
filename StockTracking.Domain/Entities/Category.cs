using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Category : BaseEntity, ISoftDelete
    {
        public Category()
        {
            Products = new HashSet<Product>();
        }

        public string Name { get; set; }
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public ICollection<Product> Products { get; set; }
    }
}