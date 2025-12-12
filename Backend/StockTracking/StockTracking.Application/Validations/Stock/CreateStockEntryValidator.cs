using FluentValidation;
using StockTracking.Application.DTOs.Stock;

namespace StockTracking.Application.Validations.Stock
{
    public class CreateStockEntryValidator : AbstractValidator<CreateStockEntryDto>
    {
        public CreateStockEntryValidator()
        {
            RuleFor(x => x.ProductId).GreaterThan(0);
            RuleFor(x => x.WarehouseId).GreaterThan(0);
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalýdýr.");
            RuleFor(x => x.ProcessType).IsInEnum();
        }
    }
}
