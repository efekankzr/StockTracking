using FluentValidation;
using StockTracking.Application.DTOs.Expense;

namespace StockTracking.Application.Validations.Expense
{
    public class CreateExpenseTransactionDtoValidator : AbstractValidator<CreateExpenseTransactionDto>
    {
        public CreateExpenseTransactionDtoValidator()
        {
            RuleFor(p => p.Amount)
                .GreaterThan(0).WithMessage("Tutar 0'dan büyük olmalıdır.");

            RuleFor(p => p.ExpenseCategoryId)
                .GreaterThan(0).WithMessage("Gider türü seçilmelidir.");

            RuleFor(p => p.WarehouseId)
                .GreaterThan(0).WithMessage("Depo seçilmelidir.");

            RuleFor(p => p.DocumentDate)
                .LessThanOrEqualTo(DateTime.Now.AddDays(1)).WithMessage("İleri tarihli fiş girişi yapılamaz.");

            RuleFor(p => p.DocumentNumber)
                .NotEmpty().WithMessage("Fiş/Fatura no boş olamaz.")
                .MaximumLength(50).WithMessage("Fiş no 50 karakteri geçemez.");
        }
    }
}
