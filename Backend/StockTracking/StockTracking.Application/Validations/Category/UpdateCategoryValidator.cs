using FluentValidation;
using StockTracking.Application.DTOs.Category;

namespace StockTracking.Application.Validations.Category
{
    public class UpdateCategoryValidator : AbstractValidator<CategoryDto>
    {
        public UpdateCategoryValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Geçersiz kategori ID.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Kategori adı boş olamaz.")
                .MaximumLength(100).WithMessage("Kategori adı 100 karakterden uzun olamaz.");

            RuleFor(x => x.IsActive)
                .NotNull().WithMessage("Aktiflik durumu belirtilmelidir.");
        }
    }
}
