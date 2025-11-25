using AutoMapper;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Services
{
    public class WarehouseService : IWarehouseService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public WarehouseService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
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
            if (existing != null)
                return new ServiceResponse<WarehouseDto>("Bu isimde bir depo zaten mevcut.");

            var warehouse = _mapper.Map<Warehouse>(request);
            await _unitOfWork.Warehouses.AddAsync(warehouse);

            await _unitOfWork.SaveChangesAsync();

            var products = await _unitOfWork.Products.GetAllAsync();

            if (products.Count > 0)
            {
                var newStocks = new List<Stock>();

                foreach (var product in products)
                {
                    newStocks.Add(new Stock
                    {
                        WarehouseId = warehouse.Id,
                        ProductId = product.Id,
                        Quantity = 0
                    });
                }

                await _unitOfWork.Stocks.AddRangeAsync(newStocks);
                await _unitOfWork.SaveChangesAsync();
            }

            return new ServiceResponse<WarehouseDto>(_mapper.Map<WarehouseDto>(warehouse), "Depo açıldı ve ürün stokları 0 olarak tanımlandı.");
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(UpdateWarehouseDto request)
        {
            var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(request.Id);
            if (warehouse == null) return new ServiceResponse<bool>("Depo bulunamadı.");

            _mapper.Map(request, warehouse);
            _unitOfWork.Warehouses.Update(warehouse);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Depo güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(id);
            if (warehouse == null) return new ServiceResponse<bool>("Depo bulunamadı.");

            _unitOfWork.Warehouses.Delete(warehouse);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Depo silindi.");
        }
    }
}