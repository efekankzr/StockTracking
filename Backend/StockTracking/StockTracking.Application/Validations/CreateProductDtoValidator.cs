using FluentValidation;
using StockTracking.Application.DTOs.Product;

namespace StockTracking.Application.Validations
{
    public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductDtoValidator()
        {
            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("Ürün adı boş olamaz.")
                .MaximumLength(100).WithMessage("Ürün adı 100 karakterden uzun olamaz.");

            RuleFor(p => p.Barcode)
                .NotEmpty().WithMessage("Barkod alanı zorunludur.")
                .MaximumLength(50).WithMessage("Barkod 50 karakterden uzun olamaz.");

            RuleFor(p => p.SalePrice)
                .GreaterThan(0).WithMessage("Satış fiyatı 0'dan büyük olmalıdır.");

            RuleFor(p => p.TaxRateSelling)
                .InclusiveBetween(0, 100).WithMessage("KDV oranı 0 ile 100 arasında olmalıdır.");

            RuleFor(p => p.CategoryId)
                .GreaterThan(0).WithMessage("Kategori seçimi zorunludur.");
        }
    }
}
