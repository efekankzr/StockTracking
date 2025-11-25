using FluentValidation;
using StockTracking.Application.DTOs.Auth;

namespace StockTracking.Application.Validations.Auth
{
    public class CreateUserValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.FullName).NotEmpty();
            RuleFor(x => x.Username).NotEmpty().MinimumLength(3);
            RuleFor(x => x.Email).EmailAddress();
            RuleFor(x => x.PhoneNumber).NotEmpty().WithMessage("Telefon numarası zorunludur.");
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
            RuleFor(x => x.RoleId).InclusiveBetween(0, 2);

            // Şartlı Validasyon: Eğer rol Admin DEĞİLSE, Depo seçmek ZORUNLU!
            When(x => x.RoleId != 0, () => {
                RuleFor(x => x.WarehouseId)
                    .NotNull().WithMessage("Personel için depo seçimi zorunludur.")
                    .GreaterThan(0).WithMessage("Geçerli bir depo seçiniz.");
            });
        }
    }
}
