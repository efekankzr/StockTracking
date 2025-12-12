using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class ExpenseCategory : BaseEntity, ISoftDelete
    {
        public string Name { get; set; } // Örn: Yemek, Elektrik, Kira, Temsil Aðýrlama
        public string? Description { get; set; } // Opsiyonel Açýklama

        // --- FÝNANSAL KURALLAR ---

        // Bu gider vergiden düþülebilir mi? (KDV indirimi yapýlabilir mi?)
        // True: Þirket gideri (Vergiden düþer)
        // False: Kanunen Kabul Edilmeyen Gider (KKEG) veya Vergisiz harcama
        public bool IsTaxDeductible { get; set; } = true;

        // Varsayýlan KDV Oraný (%1, %10, %20). Giriþ yaparken kolaylýk olsun diye.
        public int DefaultVatRate { get; set; } = 20;

        // Stopaj var mý? (Örn: Kira ödemelerinde olur)
        public bool HasWithholding { get; set; } = false;
        public int DefaultWithholdingRate { get; set; } = 0;

        // --- SÝSTEMSEL ---
        public bool IsSystemDefault { get; set; } = false; // Silinemez kayýtlar için
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        // Ýliþkiler
        public ICollection<ExpenseTransaction> Transactions { get; set; }

        public ExpenseCategory()
        {
            Transactions = new HashSet<ExpenseTransaction>();
        }
    }
}
