using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class ExpenseCategory : BaseEntity, ISoftDelete
    {
        public string Name { get; set; }
        public string NormalizedName { get; set; }
        public string? Description { get; set; }

        public bool IsTaxDeductible { get; set; } = true;
        public int DefaultVatRate { get; set; } = 20;
        public bool HasWithholding { get; set; } = false;
        public int DefaultWithholdingRate { get; set; } = 0;

        public bool IsSystemDefault { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public ICollection<ExpenseTransaction> Transactions { get; set; }

        public ExpenseCategory()
        {
            Transactions = new HashSet<ExpenseTransaction>();
        }
    }
}
