using FluentValidation;
using StockTracking.Application.DTOs.Warehouse;

namespace StockTracking.Application.Validations.Warehouse
{
    public class CreateWarehouseValidator : AbstractValidator<CreateWarehouseDto>
    {
        public CreateWarehouseValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Depo adı zorunludur.");
            RuleFor(x => x.Address).NotEmpty();
            RuleFor(x => x.City).NotEmpty();
            RuleFor(x => x.District).NotEmpty();

            // Dünya koordinat sınırları
            RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).WithMessage("Geçersiz enlem değeri.");
            RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).WithMessage("Geçersiz boylam değeri.");
        }
    }
}