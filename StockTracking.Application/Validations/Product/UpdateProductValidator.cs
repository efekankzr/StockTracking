using FluentValidation;
using StockTracking.Application.DTOs.Product;

namespace StockTracking.Application.Validations.Product
{
    public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
    {
        public UpdateProductValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Geçersiz Ürün ID.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0).WithMessage("Kategori ID geçersiz.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Ürün adı boş olamaz.");

            RuleFor(x => x.SalePrice)
                .GreaterThan(0).WithMessage("Satış fiyatı geçersiz.");
        }
    }
}