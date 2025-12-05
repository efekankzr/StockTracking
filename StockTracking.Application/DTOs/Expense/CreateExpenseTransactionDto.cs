namespace StockTracking.Application.DTOs.Expense
{
    public class CreateExpenseTransactionDto
    {
        public int ExpenseCategoryId { get; set; }
        public int WarehouseId { get; set; }

        public string DocumentNumber { get; set; }
        public DateTime DocumentDate { get; set; } = DateTime.Now;
        public string? Description { get; set; }

        // Kullanıcının Girdiği Tutar
        public decimal Amount { get; set; }

        // Bu tutar KDV Dahil mi? (True ise içinden KDV ayıklanır)
        public bool IsVatIncluded { get; set; } = true;

        // Oranlar (Boş gelirse kategoriden otomatik çekeceğiz)
        public int? VatRate { get; set; }
        public int? WithholdingRate { get; set; }
    }
}
