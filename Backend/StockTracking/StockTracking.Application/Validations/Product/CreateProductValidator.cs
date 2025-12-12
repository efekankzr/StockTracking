using FluentValidation;
using StockTracking.Application.DTOs.Product;

namespace StockTracking.Application.Validations.Product
{
    public class CreateProductValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductValidator()
        {
            RuleFor(x => x.CategoryId).GreaterThan(0).WithMessage("Kategori seçilmelidir.");
            RuleFor(x => x.Name).NotEmpty().MinimumLength(2);
            RuleFor(x => x.Barcode).NotEmpty();

            RuleFor(x => x.SalePrice)
                .GreaterThan(0).WithMessage("Satýþ fiyatý 0'dan büyük olmalýdýr.");

            RuleFor(x => x.TaxRateSelling).InclusiveBetween(0, 100);
        }
    }
}
