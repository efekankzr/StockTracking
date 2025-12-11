namespace StockTracking.Application.DTOs.Expense
{
    public class CreateExpenseCategoryDto
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsTaxDeductible { get; set; } = true;
        public int DefaultVatRate { get; set; } = 20;
        public bool HasWithholding { get; set; } = false;
        public int DefaultWithholdingRate { get; set; } = 0;
    }
}
