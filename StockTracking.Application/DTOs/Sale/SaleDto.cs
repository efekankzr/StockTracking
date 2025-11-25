namespace StockTracking.Application.DTOs.Sale
{
    public class SaleDto
    {
        public int Id { get; set; }
        public DateTime TransactionDate { get; set; }

        public string ProductName { get; set; }
        public string WarehouseName { get; set; } // Hangi şubeden satıldı?
        public string SalesPerson { get; set; } // Satan Kullanıcı

        public int Quantity { get; set; }

        // Snapshot Fiyatları Gösterilir
        public decimal UnitPrice { get; set; } // Satış anındaki birim fiyat
        public decimal TotalAmount { get; set; } // Quantity * UnitPrice

        public string PaymentMethod { get; set; } // Enum string karşılığı
    }
}