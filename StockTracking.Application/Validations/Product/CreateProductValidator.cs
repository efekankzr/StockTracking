using FluentValidation;
using StockTracking.Application.DTOs.Product;

namespace StockTracking.Application.Validations.Product
{
    public class CreateProductValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductValidator()
        {
            // Ürün Adı Kuralları
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Ürün adı boş geçilemez.")
                .NotNull().WithMessage("Ürün adı null olamaz.")
                .MaximumLength(200).WithMessage("Ürün adı 200 karakteri geçemez.")
                .MinimumLength(2).WithMessage("Ürün adı en az 2 karakter olmalıdır.");

            // Barkod Kuralları
            RuleFor(x => x.Barcode)
                .NotEmpty().WithMessage("Barkod alanı zorunludur.");

            // Fiyat Kuralları
            RuleFor(x => x.SalePrice)
                .GreaterThan(0).WithMessage("Satış fiyatı 0'dan büyük olmalıdır.");

            RuleFor(x => x.PurchasePrice)
                .GreaterThan(0).WithMessage("Alış fiyatı 0'dan büyük olmalıdır.")
                // Mantıksal Kural: Alış fiyatı satıştan büyük olamaz (Genelde)
                .LessThanOrEqualTo(x => x.SalePrice).WithMessage("Alış fiyatı satış fiyatından yüksek olamaz.");

            // KDV Oranları
            RuleFor(x => x.TaxRateSelling)
                .InclusiveBetween(0, 100).WithMessage("KDV oranı 0 ile 100 arasında olmalıdır.");
        }
    }
}