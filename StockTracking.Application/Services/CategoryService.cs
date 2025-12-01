using AutoMapper;
using StockTracking.Application.DTOs.Category;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<CategoryDto>>> GetAllAsync()
        {
            var categories = await _unitOfWork.Categories.GetAllAsync();
            return new ServiceResponse<List<CategoryDto>>(_mapper.Map<List<CategoryDto>>(categories));
        }

        public async Task<ServiceResponse<CategoryDto>> GetByIdAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return new ServiceResponse<CategoryDto>("Kategori bulunamadı.");
            return new ServiceResponse<CategoryDto>(_mapper.Map<CategoryDto>(category));
        }

        public async Task<ServiceResponse<CategoryDto>> CreateAsync(CreateCategoryDto request)
        {
            var category = _mapper.Map<Category>(request);
            await _unitOfWork.Categories.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<CategoryDto>(_mapper.Map<CategoryDto>(category), "Kategori eklendi.");
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(UpdateCategoryDto request)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(request.Id);
            if (category == null) return new ServiceResponse<bool>("Kategori bulunamadı.");

            _mapper.Map(request, category);
            _unitOfWork.Categories.Update(category);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Kategori güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return new ServiceResponse<bool>("Kategori bulunamadı.");

            var hasProducts = await _unitOfWork.Products.GetSingleAsync(p => p.CategoryId == id && !p.IsDeleted);

            if (hasProducts != null)
            {
                return new ServiceResponse<bool>("Bu kategoriye bağlı aktif ürünler bulunmaktadır. Kategori silinemez veya pasife alınamaz.");
            }

            if (category.IsActive)
            {
                category.IsActive = false;
                _unitOfWork.Categories.Update(category);
                await _unitOfWork.SaveChangesAsync();

                return new ServiceResponse<bool>(true, "Kategori pasife alındı (Arşivlendi).");
            }
            else
            {
                _unitOfWork.Categories.Delete(category);
                await _unitOfWork.SaveChangesAsync();

                return new ServiceResponse<bool>(true, "Kategori silindi (Geri dönüşüm kutusuna atıldı).");
            }
        }

        public async Task<ServiceResponse<bool>> ActivateAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return new ServiceResponse<bool>("Kategori bulunamadı.");

            if (!category.IsActive)
            {
                category.IsActive = true;
                _unitOfWork.Categories.Update(category);
                await _unitOfWork.SaveChangesAsync();
                return new ServiceResponse<bool>(true, "Kategori tekrar aktif edildi.");
            }

            return new ServiceResponse<bool>("Kategori zaten aktif.");
        }

        public async Task<ServiceResponse<bool>> HardDeleteAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return new ServiceResponse<bool>("Kategori bulunamadı.");

            var hasProducts = await _unitOfWork.Products.GetSingleAsync(p => p.CategoryId == id && !p.IsDeleted);
            if (hasProducts != null)
            {
                return new ServiceResponse<bool>("Bağlı ürünler var, silinemez.");
            }

            _unitOfWork.Categories.Delete(category);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Kategori silindi.");
        }
    }
}