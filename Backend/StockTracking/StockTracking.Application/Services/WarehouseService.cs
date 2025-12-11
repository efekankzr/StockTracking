using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using System.Text.RegularExpressions;

namespace StockTracking.Application.Services
{
    public class WarehouseService : IWarehouseService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;

        public WarehouseService(IUnitOfWork unitOfWork, IMapper mapper, UserManager<User> userManager, RoleManager<IdentityRole<int>> roleManager)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<ServiceResponse<List<WarehouseDto>>> GetAllAsync()
        {
            var warehouses = await _unitOfWork.Warehouses.GetAllAsync();
            return new ServiceResponse<List<WarehouseDto>>(_mapper.Map<List<WarehouseDto>>(warehouses));
        }

        public async Task<ServiceResponse<WarehouseDto>> GetByIdAsync(int id)
        {
            var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(id);
            if (warehouse == null) return new ServiceResponse<WarehouseDto>("Depo bulunamadı.");
            return new ServiceResponse<WarehouseDto>(_mapper.Map<WarehouseDto>(warehouse));
        }

        public async Task<ServiceResponse<WarehouseDto>> CreateAsync(CreateWarehouseDto request)
        {
            var existing = await _unitOfWork.Warehouses.GetSingleAsync(w => w.Name == request.Name);
            if (existing != null) return new ServiceResponse<WarehouseDto>("Bu isimde bir depo zaten mevcut.");

            var warehouse = _mapper.Map<Warehouse>(request);
            
            // Auto-set Tax Rates based on RentType
            if (warehouse.RentType == Domain.Enums.RentType.Sahis)
            {
                warehouse.StopajRate = 20;
                warehouse.VatRate = 0;
            }
            else if (warehouse.RentType == Domain.Enums.RentType.Sirket)
            {
                warehouse.StopajRate = 0;
                warehouse.VatRate = 20; 
            }

            await _unitOfWork.Warehouses.AddAsync(warehouse);
            await _unitOfWork.SaveChangesAsync();

            var products = await _unitOfWork.Products.GetAllAsync();
            if (products.Count > 0)
            {
                var newStocks = new List<Stock>();
                foreach (var product in products)
                {
                    newStocks.Add(new Stock { WarehouseId = warehouse.Id, ProductId = product.Id, Quantity = 0, AverageCost = 0, LastPurchasePrice = 0 });
                }
                await _unitOfWork.Stocks.AddRangeAsync(newStocks);
                await _unitOfWork.SaveChangesAsync();
            }

            string cleanName = CleanUsername(warehouse.Name);
            string password = "Password123!";

            var managerUser = new User { FullName = $"{request.Name} Depo", UserName = $"{cleanName}_depo", Email = $"{cleanName}_depo@stock.com", PhoneNumber = "5550000000", WarehouseId = warehouse.Id, IsActive = true };
            await CreateUserWithRole(managerUser, password, "DepoSorumlusu");

            var salesUser = new User { FullName = $"{request.Name} Satış", UserName = $"{cleanName}_satis", Email = $"{cleanName}_satis@stock.com", PhoneNumber = "5550000000", WarehouseId = warehouse.Id, IsActive = true };
            await CreateUserWithRole(salesUser, password, "SatisPersoneli");

            return new ServiceResponse<WarehouseDto>(_mapper.Map<WarehouseDto>(warehouse), $"Depo açıldı. Kullanıcılar oluşturuldu: {managerUser.UserName} ve {salesUser.UserName}");
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(UpdateWarehouseDto request)
        {
            var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(request.Id);
            if (warehouse == null) return new ServiceResponse<bool>("Depo bulunamadı.");
            _mapper.Map(request, warehouse);

             // Auto-set Tax Rates based on RentType (if changed)
            if (warehouse.RentType == Domain.Enums.RentType.Sahis)
            {
                warehouse.StopajRate = 20;
                warehouse.VatRate = 0;
            }
            else if (warehouse.RentType == Domain.Enums.RentType.Sirket)
            {
                warehouse.StopajRate = 0;
                warehouse.VatRate = 20;
            }

            _unitOfWork.Warehouses.Update(warehouse);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Depo güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(id);
            if (warehouse == null) return new ServiceResponse<bool>("Depo bulunamadı.");

            var hasStock = await _unitOfWork.Stocks.GetSingleAsync(s => s.WarehouseId == id && s.Quantity > 0);
            if (hasStock != null) return new ServiceResponse<bool>("Bu depoda stok var. Silinemez.");

            await _unitOfWork.Warehouses.ArchiveAsync(id);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Depo pasife alındı (Arşivlendi).");
        }

        public async Task<ServiceResponse<bool>> ActivateAsync(int id)
        {
            var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(id);
            if (warehouse == null) return new ServiceResponse<bool>("Depo bulunamadı.");

            await _unitOfWork.Warehouses.RestoreAsync(id);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Depo tekrar aktif edildi.");
        }

        public async Task<ServiceResponse<bool>> HardDeleteAsync(int id)
        {
            var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(id);
            if (warehouse == null) return new ServiceResponse<bool>("Depo bulunamadı.");

            var hasStock = await _unitOfWork.Stocks.GetSingleAsync(s => s.WarehouseId == id && s.Quantity > 0);
            if (hasStock != null) return new ServiceResponse<bool>("Bu depoda stok var. Silinemez.");

            _unitOfWork.Warehouses.Delete(warehouse);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Depo tamamen silindi.");
        }

        private async Task CreateUserWithRole(User user, string password, string role)
        {
            var result = await _userManager.CreateAsync(user, password);
            if (result.Succeeded)
            {
                if (!await _roleManager.RoleExistsAsync(role)) await _roleManager.CreateAsync(new IdentityRole<int>(role));
                await _userManager.AddToRoleAsync(user, role);
            }
        }
        private string CleanUsername(string text)
        {
            string unaccented = text.ToLower().Replace('ı', 'i').Replace('ğ', 'g').Replace('ü', 'u').Replace('ş', 's').Replace('ö', 'o').Replace('ç', 'c').Replace(' ', '_');
            return Regex.Replace(unaccented, "[^a-z0-9_]", "");
        }
    }
}