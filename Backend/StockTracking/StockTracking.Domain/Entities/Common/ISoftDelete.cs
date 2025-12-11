namespace StockTracking.Domain.Entities.Common
{
    public interface ISoftDelete
    {
        bool IsDeleted { get; set; }
        bool IsActive { get; set; }
    }
}