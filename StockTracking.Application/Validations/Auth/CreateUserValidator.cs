using FluentValidation;
using StockTracking.Application.DTOs.Auth;

namespace StockTracking.Application.Validations.Auth
{
    public class CreateUserValidator : AbstractValidator<RegisterDto>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("İsim Soyisim gereklidir.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email adresi gereklidir.")
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre boş olamaz.")
                .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");
        }
    }
}