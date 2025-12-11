using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class ExpenseCategory : BaseEntity, ISoftDelete
    {
        public string Name { get; set; } // Örn: Yemek, Elektrik, Kira, Temsil Ağırlama
        public string? Description { get; set; } // Opsiyonel Açıklama

        // --- FİNANSAL KURALLAR ---

        // Bu gider vergiden düşülebilir mi? (KDV indirimi yapılabilir mi?)
        // True: Şirket gideri (Vergiden düşer)
        // False: Kanunen Kabul Edilmeyen Gider (KKEG) veya Vergisiz harcama
        public bool IsTaxDeductible { get; set; } = true;

        // Varsayılan KDV Oranı (%1, %10, %20). Giriş yaparken kolaylık olsun diye.
        public int DefaultVatRate { get; set; } = 20;

        // Stopaj var mı? (Örn: Kira ödemelerinde olur)
        public bool HasWithholding { get; set; } = false;
        public int DefaultWithholdingRate { get; set; } = 0;

        // --- SİSTEMSEL ---
        public bool IsSystemDefault { get; set; } = false; // Silinemez kayıtlar için
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        // İlişkiler
        public ICollection<ExpenseTransaction> Transactions { get; set; }

        public ExpenseCategory()
        {
            Transactions = new HashSet<ExpenseTransaction>();
        }
    }
}