namespace StockTracking.Application.DTOs.Expense
{
    public class ExpenseCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsTaxDeductible { get; set; }
        public int DefaultVatRate { get; set; }
        public bool HasWithholding { get; set; }
        public int DefaultWithholdingRate { get; set; }
        public bool IsSystemDefault { get; set; }
    }    
}