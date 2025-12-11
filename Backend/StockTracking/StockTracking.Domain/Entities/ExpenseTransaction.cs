using StockTracking.Domain.Entities.Common;

namespace StockTracking.Domain.Entities
{
    public class ExpenseTransaction : BaseEntity
    {
        // --- İLİŞKİLER ---
        public int ExpenseCategoryId { get; set; }
        public ExpenseCategory ExpenseCategory { get; set; }

        // Bu gider hangi depoya/şubeye ait? (Elektrik faturası hangi dükkanın?)
        public int WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; }

        // Kaydı kim girdi?
        public int UserId { get; set; }
        public User User { get; set; }


        // --- BELGE BİLGİLERİ ---
        public string DocumentNumber { get; set; } // Fiş/Fatura No
        public DateTime DocumentDate { get; set; } // Faturanın Kesildiği Tarih
        public string? Description { get; set; }   // Zorunlu olmayan açıklama


        // --- FİNANSAL HESAPLAMALAR ---
        // Decimal(18,2) parasal değerler için idealdir.

        // 1. Matrah (Vergisiz Tutar)
        public decimal BaseAmount { get; set; }

        // 2. KDV
        public int VatRate { get; set; } // %1, %10, %20
        public decimal VatAmount { get; set; } // Hesaplanan KDV Tutarı

        // 3. Stopaj (Varsa)
        public int WithholdingRate { get; set; } // %20 vb.
        public decimal WithholdingAmount { get; set; }

        // 4. Genel Toplam (Kasadan Çıkan Para)
        public decimal TotalAmount { get; set; }

        // --- LOGLAMA ---
        // Kullanıcı tutarı girerken "KDV Dahil" seçeneğini mi kullandı?
        // (UI tarafında hesaplamayı tersine çevirmek veya loglamak için)
        public bool IsVatIncludedEntry { get; set; }
    }
}