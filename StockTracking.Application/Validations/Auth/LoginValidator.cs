using FluentValidation;
using StockTracking.Application.DTOs.Auth;

namespace StockTracking.Application.Validations.Auth
{
    public class LoginValidator : AbstractValidator<LoginDto>
    {
        public LoginValidator()
        {
            RuleFor(x => x.Username).NotEmpty().WithMessage("Kullanıcı adı giriniz.");
            RuleFor(x => x.Password).NotEmpty().WithMessage("Şifre giriniz.");
        }
    }
}