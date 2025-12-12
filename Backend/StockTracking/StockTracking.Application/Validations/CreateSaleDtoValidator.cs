using FluentValidation;
using StockTracking.Application.DTOs.Sale;

namespace StockTracking.Application.Validations
{
    public class CreateSaleDtoValidator : AbstractValidator<CreateSaleDto>
    {
        public CreateSaleDtoValidator()
        {
            RuleFor(s => s.WarehouseId)
                .GreaterThan(0).WithMessage("Depo seçimi zorunludur.");

            RuleFor(s => s.Items)
                .NotEmpty().WithMessage("Satış yapılacak ürün listesi boş olamaz.");

            RuleForEach(s => s.Items).SetValidator(new SaleItemDtoValidator());
        }
    }

    public class SaleItemDtoValidator : AbstractValidator<SaleItemDto>
    {
        public SaleItemDtoValidator()
        {
            RuleFor(i => i.ProductId)
                .GreaterThan(0).WithMessage("Ürün ID geçersiz.");

            RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır.");
        }
    }
}
