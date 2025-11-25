using FluentValidation;
using StockTracking.Application.DTOs.Product;

namespace StockTracking.Application.Validations.Product
{
    public class CreateProductValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductValidator()
        {
            RuleFor(x => x.CategoryId)
                .GreaterThan(0).WithMessage("Bir kategori seçmelisiniz.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Ürün adı zorunludur.")
                .MinimumLength(2).WithMessage("Ürün adı en az 2 karakter olmalıdır.");

            RuleFor(x => x.Barcode)
                .NotEmpty().WithMessage("Barkod zorunludur.");

            // Fiyat Kontrolleri
            RuleFor(x => x.PurchasePrice)
                .GreaterThan(0).WithMessage("Alış fiyatı 0'dan büyük olmalıdır.");

            RuleFor(x => x.SalePrice)
                .GreaterThan(0).WithMessage("Satış fiyatı 0'dan büyük olmalıdır.")
                .GreaterThanOrEqualTo(x => x.PurchasePrice).WithMessage("Satış fiyatı alış fiyatından düşük olamaz (Zararına satış uyarısı).");

            // Vergi Oranları (0 ile 100 arası)
            RuleFor(x => x.TaxRateBuying).InclusiveBetween(0, 100);
            RuleFor(x => x.TaxRateSelling).InclusiveBetween(0, 100);
        }
    }
}