using AutoMapper;
using StockTracking.Application.DTOs.Product;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<ProductListDto>>> GetAllAsync()
        {
            // 1. Veritabanından tüm ürünleri çek
            var products = await _unitOfWork.Products.GetAllAsync();

            // 2. Entity Listesini DTO Listesine çevir
            var dtoList = _mapper.Map<List<ProductListDto>>(products);

            // 3. Paketi sarıp gönder
            return new ServiceResponse<List<ProductListDto>>(dtoList);
        }

        public async Task<ServiceResponse<ProductDto>> GetByIdAsync(int id)
        {
            // 1. Ürünü bul
            var product = await _unitOfWork.Products.GetByIdAsync(id);

            // 2. Kontrol et
            if (product == null)
            {
                return new ServiceResponse<ProductDto>("Ürün bulunamadı.");
            }

            // 3. Entity -> DTO dönüşümü
            var dto = _mapper.Map<ProductDto>(product);

            return new ServiceResponse<ProductDto>(dto);
        }

        public async Task<ServiceResponse<ProductDto>> CreateAsync(CreateProductDto request)
        {
            // 1. DTO'yu Entity'e çevir (Validasyonlar zaten Controller girişinde yapıldı)
            var product = _mapper.Map<Product>(request);

            // 2. Repository'e ekle (Henüz DB'ye gitmedi, hafızada bekliyor)
            await _unitOfWork.Products.AddAsync(product);

            // 3. Değişiklikleri kaydet (Transaction burada çalışır)
            await _unitOfWork.SaveChangesAsync();

            // 4. Oluşan ID ile birlikte geriye dönmek için tekrar map'le
            var responseDto = _mapper.Map<ProductDto>(product);

            return new ServiceResponse<ProductDto>(responseDto, "Ürün başarıyla oluşturuldu.");
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(UpdateProductDto request)
        {
            // 1. Güncellenecek kayıt var mı?
            var product = await _unitOfWork.Products.GetByIdAsync(request.Id);

            if (product == null)
                return new ServiceResponse<bool>("Güncellenecek ürün bulunamadı.");

            // 2. AutoMapper ile gelen verileri mevcudun üzerine yaz
            // Bu yöntem, manuel eşleştirmeden (product.Name = request.Name) çok daha temizdir.
            _mapper.Map(request, product);

            // 3. Update metodunu çağır (ChangeTracker durumu Modified yapar)
            _unitOfWork.Products.Update(product);

            // 4. Kaydet
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Ürün başarıyla güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            // 1. Silinecek kayıt var mı?
            var product = await _unitOfWork.Products.GetByIdAsync(id);

            if (product == null)
                return new ServiceResponse<bool>("Silinecek ürün bulunamadı.");

            // 2. Sil (Bizim GenericRepo'da Delete entity istiyor, DeleteAsync ID istiyor)
            // UnitOfWork üzerinden silme işlemi:
            _unitOfWork.Products.Delete(product);

            // Veya GenericRepo'da DeleteAsync(id) varsa direkt onu da kullanabilirsin:
            // await _unitOfWork.Products.DeleteAsync(id);

            // 3. Kaydet
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Ürün başarıyla silindi.");
        }
    }
}