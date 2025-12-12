using FluentValidation;
using StockTracking.Application.DTOs.Warehouse;

namespace StockTracking.Application.Validations.Warehouse
{
    public class UpdateWarehouseValidator : AbstractValidator<UpdateWarehouseDto>
    {
        public UpdateWarehouseValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Geçersiz Depo ID.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Depo adý boþ geçilemez.");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Adres bilgisi gereklidir.");
        }
    }
}
