using FluentValidation;
using StockTracking.Application.DTOs.Sale;

namespace StockTracking.Application.Validations.Sale
{
    public class CreateSaleValidator : AbstractValidator<CreateSaleDto>
    {
        public CreateSaleValidator()
        {
            RuleFor(x => x.ProductId).GreaterThan(0);
            RuleFor(x => x.WarehouseId).GreaterThan(0).WithMessage("Depo seçimi zorunludur.");
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Satış adedi en az 1 olmalıdır.");
            RuleFor(x => x.PaymentMethod).IsInEnum().WithMessage("Geçersiz ödeme yöntemi.");
        }
    }
}