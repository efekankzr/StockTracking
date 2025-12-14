using AutoMapper;
using StockTracking.Application.DTOs.Product;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using StockTracking.Application.Extensions;

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
            var products = await _unitOfWork.Products.GetAllWithDetailsAsync();
            return new ServiceResponse<List<ProductListDto>>(_mapper.Map<List<ProductListDto>>(products));
        }

        public async Task<ServiceResponse<ProductDto>> GetByIdAsync(int id)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null) return ServiceResponse<ProductDto>.Fail("Ürün bulunamadı.");
            return new ServiceResponse<ProductDto>(_mapper.Map<ProductDto>(product));
        }

        public async Task<ServiceResponse<ProductDto>> CreateAsync(CreateProductDto request)
        {
            var existingProduct = await _unitOfWork.Products.GetSingleAsync(p => p.Barcode == request.Barcode);
            if (existingProduct != null)
            {
                return ServiceResponse<ProductDto>.Fail("Bu barkoda sahip bir ürün zaten mevcut.");
            }

            var normalizedName = request.Name.ToNormalizedString();
            var existingProductByName = await _unitOfWork.Products.GetSingleAsync(p => p.NormalizedName == normalizedName && !p.IsDeleted);
            if (existingProductByName != null) return ServiceResponse<ProductDto>.Fail("Bu isimde bir ürün zaten mevcut.");

            var product = _mapper.Map<Product>(request);
            product.NormalizedName = normalizedName;
            await _unitOfWork.Products.AddAsync(product);
            await _unitOfWork.SaveChangesAsync();

            var warehouses = await _unitOfWork.Warehouses.GetAllAsync();
            if (warehouses.Count > 0)
            {
                var newStocks = new List<Stock>();
                foreach (var warehouse in warehouses)
                {
                    newStocks.Add(new Stock { ProductId = product.Id, WarehouseId = warehouse.Id, Quantity = 0 });
                }
                await _unitOfWork.Stocks.AddRangeAsync(newStocks);
                await _unitOfWork.SaveChangesAsync();
            }
            return new ServiceResponse<ProductDto>(_mapper.Map<ProductDto>(product), "Ürün eklendi.");
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(UpdateProductDto request)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(request.Id);
            if (product == null) return ServiceResponse<bool>.Fail("Ürün bulunamadı.");

            if (product.Name != request.Name)
            {
                var normalizedName = request.Name.ToNormalizedString();
                var existingProductByName = await _unitOfWork.Products.GetSingleAsync(p => p.NormalizedName == normalizedName && p.Id != request.Id && !p.IsDeleted);
                if (existingProductByName != null) return ServiceResponse<bool>.Fail("Bu isimde başka bir ürün zaten mevcut.");
                product.NormalizedName = normalizedName;
            }

            _mapper.Map(request, product);
            _unitOfWork.Products.Update(product);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Ürün güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null) return ServiceResponse<bool>.Fail("Ürün bulunamadı.");

            var hasStock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == id && s.Quantity > 0);
            if (hasStock != null) return ServiceResponse<bool>.Fail("Bu ürünün stoğu var, silinemez.");

            await _unitOfWork.Products.ArchiveAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Ürün pasife alındı.");
        }

        public async Task<ServiceResponse<bool>> ActivateAsync(int id)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null) return ServiceResponse<bool>.Fail("Ürün bulunamadı.");

            await _unitOfWork.Products.RestoreAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Ürün aktif edildi.");
        }

        public async Task<ServiceResponse<bool>> HardDeleteAsync(int id)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null) return ServiceResponse<bool>.Fail("Ürün bulunamadı.");

            var hasStock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == id && s.Quantity > 0);
            if (hasStock != null) return ServiceResponse<bool>.Fail("Stok var, silinemez.");

            _unitOfWork.Products.Delete(product);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Ürün tamamen silindi.");
        }
    }
}
