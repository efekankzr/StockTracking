using FluentValidation;
using StockTracking.Application.DTOs.Category;

namespace StockTracking.Application.Validations.Category
{
    public class UpdateCategoryValidator : AbstractValidator<UpdateCategoryDto>
    {
        public UpdateCategoryValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Geçersiz Kategori ID.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Kategori adı boş geçilemez.")
                .MaximumLength(100).WithMessage("Kategori adı 100 karakterden uzun olamaz.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Açıklama 500 karakterden uzun olamaz.");
        }
    }
}