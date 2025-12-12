using FluentValidation;
using StockTracking.Application.DTOs.Expense;

namespace StockTracking.Application.Validations
{
    public class CreateExpenseTransactionDtoValidator : AbstractValidator<CreateExpenseTransactionDto>
    {
        public CreateExpenseTransactionDtoValidator()
        {
            RuleFor(x => x.ExpenseCategoryId)
                .GreaterThan(0).WithMessage("Gider kategorisi seçimi zorunludur.");

            RuleFor(x => x.WarehouseId)
                .GreaterThan(0).WithMessage("Depo seçimi zorunludur.");

            RuleFor(x => x.DocumentNumber)
                .NotEmpty().WithMessage("Belge/Fiş numarası zorunludur.");

            RuleFor(x => x.DocumentDate)
                .NotEmpty().WithMessage("Belge tarihi zorunludur.");

             RuleFor(x => x.TotalAmount)
                .GreaterThan(0).WithMessage("Tutar 0'dan büyük olmalıdır.");
        }
    }
}
