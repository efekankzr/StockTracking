using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class ExpenseTransaction : BaseEntity
    {
        // --- ÝLÝÞKÝLER ---
        public int ExpenseCategoryId { get; set; }
        public ExpenseCategory ExpenseCategory { get; set; }

        // Bu gider hangi depoya/þubeye ait? (Elektrik faturasý hangi dükkanýn?)
        public int WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; }

        // Kaydý kim girdi?
        public int UserId { get; set; }
        public User User { get; set; }


        // --- BELGE BÝLGÝLERÝ ---
        public string DocumentNumber { get; set; } // Fiþ/Fatura No
        public DateTime DocumentDate { get; set; } // Faturanýn Kesildiði Tarih
        public string? Description { get; set; }   // Zorunlu olmayan açýklama


        // --- FÝNANSAL HESAPLAMALAR ---
        // Decimal(18,2) parasal deðerler için idealdir.

        // 1. Matrah (Vergisiz Tutar)
        public decimal BaseAmount { get; set; }

        // 2. KDV
        public int VatRate { get; set; } // %1, %10, %20
        public decimal VatAmount { get; set; } // Hesaplanan KDV Tutarý

        // 3. Stopaj (Varsa)
        public int WithholdingRate { get; set; } // %20 vb.
        public decimal WithholdingAmount { get; set; }

        // 4. Genel Toplam (Kasadan Çýkan Para)
        public decimal TotalAmount { get; set; }

        // --- LOGLAMA ---
        // Kullanýcý tutarý girerken "KDV Dahil" seçeneðini mi kullandý?
        // (UI tarafýnda hesaplamayý tersine çevirmek veya loglamak için)
        public bool IsVatIncludedEntry { get; set; }
    }
}
