using FluentValidation;
using StockTracking.Application.DTOs.User;

namespace StockTracking.Application.Validations.User
{
    public class CreateUserValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Ad Soyad boþ geçilemez.");

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Kullanýcý adý boþ geçilemez.")
                .MinimumLength(3).WithMessage("Kullanýcý adý en az 3 karakter olmalýdýr.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta adresi boþ geçilemez.")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarasý zorunludur.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Þifre boþ geçilemez.")
                .MinimumLength(6).WithMessage("Þifre en az 6 karakter olmalýdýr.");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Rol seçimi zorunludur.")
                .Must(role => role == "Admin" || role == "DepoSorumlusu" || role == "SatisPersoneli")
                .WithMessage("Geçersiz rol seçimi.");

            When(x => x.Role != "Admin", () => {
                RuleFor(x => x.WarehouseId)
                    .NotNull().WithMessage("Personel için depo seçimi zorunludur.")
                    .GreaterThan(0).WithMessage("Geçerli bir depo seçiniz.");
            });
        }
    }
}
