using FluentValidation;
using StockTracking.Application.DTOs.Warehouse;

namespace StockTracking.Application.Validations.Warehouse
{
    public class CreateWarehouseValidator : AbstractValidator<CreateWarehouseDto>
    {
        public CreateWarehouseValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Depo adı boş geçilemez.")
                .MaximumLength(100).WithMessage("Depo adı çok uzun.");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Adres bilgisi gereklidir.");

            RuleFor(x => x.ManagerName)
                .NotEmpty().WithMessage("Depo sorumlusu belirtilmelidir.");
        }
    }
}