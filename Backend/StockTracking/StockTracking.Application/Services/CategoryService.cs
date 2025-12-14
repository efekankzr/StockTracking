using AutoMapper;
using StockTracking.Application.DTOs.Category;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using StockTracking.Application.Extensions;

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
            if (category == null) return ServiceResponse<CategoryDto>.Fail("Kategori bulunamadı.");
            return new ServiceResponse<CategoryDto>(_mapper.Map<CategoryDto>(category));
        }

        public async Task<ServiceResponse<CategoryDto>> CreateAsync(CreateCategoryDto request)
        {
            var normalizedName = request.Name.ToNormalizedString();
            var existingCategory = await _unitOfWork.Categories.GetSingleAsync(c => c.NormalizedName == normalizedName && !c.IsDeleted);
            if (existingCategory != null) return ServiceResponse<CategoryDto>.Fail("Bu isimde bir kategori zaten mevcut.");

            var category = _mapper.Map<Category>(request);
            category.NormalizedName = normalizedName;

            await _unitOfWork.Categories.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<CategoryDto>(_mapper.Map<CategoryDto>(category), "Kategori eklendi.");
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(UpdateCategoryDto request)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(request.Id);
            if (category == null) return ServiceResponse<bool>.Fail("Kategori bulunamadı.");

            if (category.Name != request.Name)
            {
                var normalizedName = request.Name.ToNormalizedString();
                var existingCategory = await _unitOfWork.Categories.GetSingleAsync(c => c.NormalizedName == normalizedName && c.Id != request.Id && !c.IsDeleted);
                if (existingCategory != null) return ServiceResponse<bool>.Fail("Bu isimde başka bir kategori zaten mevcut.");
                
                category.NormalizedName = normalizedName;
            }

            _mapper.Map(request, category);
            // NormalizedName might be overwritten by Mapper if mapped, but likely not mapped from DTO since DTO doesn't have it.
            // But to be safe, I set it above, validation check done.
            // If DTO has Name, Mapper sets Name. NormalizedName I set manually.

            _unitOfWork.Categories.Update(category);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Kategori güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return ServiceResponse<bool>.Fail("Kategori bulunamadı.");

            var hasProducts = await _unitOfWork.Products.GetSingleAsync(p => p.CategoryId == id && !p.IsDeleted);
            if (hasProducts != null) return ServiceResponse<bool>.Fail("Bu kategoriye bağlı ürünler var. Silinemez.");

            await _unitOfWork.Categories.ArchiveAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Kategori pasife alındı.");
        }

        public async Task<ServiceResponse<bool>> ActivateAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return ServiceResponse<bool>.Fail("Kategori bulunamadı.");

            await _unitOfWork.Categories.RestoreAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Kategori aktif edildi.");
        }

        public async Task<ServiceResponse<bool>> HardDeleteAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return ServiceResponse<bool>.Fail("Kategori bulunamadı.");

            var hasProducts = await _unitOfWork.Products.GetSingleAsync(p => p.CategoryId == id && !p.IsDeleted);
            if (hasProducts != null) return ServiceResponse<bool>.Fail("Bağlı ürünler var.");

            _unitOfWork.Categories.Delete(category);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Kategori tamamen silindi.");
        }
    }
}
