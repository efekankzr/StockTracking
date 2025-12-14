using FluentValidation;
using StockTracking.Application.DTOs.Category;

namespace StockTracking.Application.Validations.Category
{
    public class CreateCategoryValidator : AbstractValidator<CreateCategoryDto>
    {
        public CreateCategoryValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Kategori adı boş olamaz.")
                .MaximumLength(100).WithMessage("Kategori adı 100 karakterden uzun olamaz.");
        }
    }
}
