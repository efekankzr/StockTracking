using FluentValidation;
using StockTracking.Application.DTOs.Sale;

namespace StockTracking.Application.Validations.Sale
{
    public class CreateSaleValidator : AbstractValidator<CreateSaleDto>
    {
        public CreateSaleValidator()
        {
            RuleFor(x => x.WarehouseId)
                .GreaterThan(0).WithMessage("Depo seçimi zorunludur.");

            RuleFor(x => x.Items)
                .NotNull().WithMessage("Sepet boş olamaz.")
                .Must(items => items != null && items.Count > 0).WithMessage("Sepete en az bir ürün eklemelisiniz.");

            RuleForEach(x => x.Items).SetValidator(new CreateSaleItemValidator());
        }
    }

    public class CreateSaleItemValidator : AbstractValidator<CreateSaleItemDto>
    {
        public CreateSaleItemValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0).WithMessage("Geçersiz ürün.");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Satış adedi en az 1 olmalıdır.");

            RuleFor(x => x.UnitPrice)
                .GreaterThan(0).When(x => x.UnitPrice.HasValue)
                .WithMessage("Fiyat 0'dan büyük olmalıdır.");
        }
    }
}
