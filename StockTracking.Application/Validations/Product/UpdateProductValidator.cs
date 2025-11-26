using FluentValidation;
using StockTracking.Application.DTOs.Product;

namespace StockTracking.Application.Validations.Product
{
    public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
    {
        public UpdateProductValidator()
        {
            RuleFor(x => x.CategoryId).GreaterThan(0).WithMessage("Kategori seçilmelidir.");
            RuleFor(x => x.Name).NotEmpty().MinimumLength(2);
            RuleFor(x => x.Barcode).NotEmpty();

            RuleFor(x => x.SalePrice)
                .GreaterThan(0).WithMessage("Satış fiyatı 0'dan büyük olmalıdır.");

            RuleFor(x => x.TaxRateSelling).InclusiveBetween(0, 100);
        }
    }
}