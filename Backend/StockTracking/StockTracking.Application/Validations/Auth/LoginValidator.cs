using FluentValidation;
using StockTracking.Application.DTOs.Auth;

namespace StockTracking.Application.Validations.Auth
{
    public class LoginValidator : AbstractValidator<LoginDto>
    {
        public LoginValidator()
        {
            RuleFor(x => x.Username).NotEmpty().WithMessage("Kullanýcý adý giriniz.");
            RuleFor(x => x.Password).NotEmpty().WithMessage("Þifre giriniz.");
        }
    }
}
