using FluentValidation;
using StockTracking.Application.DTOs.Role;

namespace StockTracking.Application.Validations.Role
{
    public class CreateRoleValidator : AbstractValidator<CreateRoleDto>
    {
        public CreateRoleValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Rol adı boş olamaz.")
                .MinimumLength(3).WithMessage("Rol adı en az 3 karakter olmalıdır.");
        }
    }
}