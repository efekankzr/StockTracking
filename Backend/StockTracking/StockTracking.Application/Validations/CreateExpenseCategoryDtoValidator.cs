using FluentValidation;
using StockTracking.Application.DTOs.Expense;

namespace StockTracking.Application.Validations
{
    public class CreateExpenseCategoryDtoValidator : AbstractValidator<CreateExpenseCategoryDto>
    {
        public CreateExpenseCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Kategori adı zorunludur.")
                .MaximumLength(100).WithMessage("Kategori adı 100 karakterden uzun olamaz.");
        }
    }
}
