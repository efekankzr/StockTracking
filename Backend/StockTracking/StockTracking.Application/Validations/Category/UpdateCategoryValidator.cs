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
                .NotEmpty().WithMessage("Kategori adý boþ geçilemez.")
                .MaximumLength(100).WithMessage("Kategori adý 100 karakterden uzun olamaz.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Açýklama 500 karakterden uzun olamaz.");
        }
    }
}
