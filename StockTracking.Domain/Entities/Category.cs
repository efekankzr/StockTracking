using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class Category : BaseEntity
    {
        public Category()
        {
            // Null Reference hatası almamak için listeyi başlatıyoruz
            Products = new HashSet<Product>();
        }

        public string Name { get; set; }
        public string Description { get; set; }

        // İlişkiler
        public ICollection<Product> Products { get; set; }
    }
}