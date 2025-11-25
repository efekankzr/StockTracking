namespace StockTracking.Domain.Entities.Common
{
    public abstract class BaseEntity : IEntity // <-- IEntity eklendi
    {
        public int Id { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}