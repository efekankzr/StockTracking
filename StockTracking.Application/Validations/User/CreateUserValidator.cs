using FluentValidation;
using StockTracking.Application.DTOs.User;

namespace StockTracking.Application.Validations.User
{
    public class CreateUserValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Ad Soyad boş geçilemez.");

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Kullanıcı adı boş geçilemez.")
                .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta adresi boş geçilemez.")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası zorunludur.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre boş geçilemez.")
                .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");

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