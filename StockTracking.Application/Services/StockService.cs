using AutoMapper;
using StockTracking.Application.DTOs.Stock;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;

namespace StockTracking.Application.Services
{
    public class StockService : IStockService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public StockService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<StockDto>>> GetAllStocksAsync()
        {

            var stocks = await _unitOfWork.Stocks.GetAllWithDetailsAsync();
            return new ServiceResponse<List<StockDto>>(_mapper.Map<List<StockDto>>(stocks));
        }

        public async Task<ServiceResponse<List<StockDto>>> GetStockByProductIdAsync(int productId)
        {
            var stocks = await _unitOfWork.Stocks.GetWhereAsync(s => s.ProductId == productId);
            return new ServiceResponse<List<StockDto>>(_mapper.Map<List<StockDto>>(stocks));
        }

        public async Task<ServiceResponse<bool>> CreateStockEntryAsync(CreateStockEntryDto request, int currentUserId)
        {
            // 1. Stok Kaydı Var mı?
            var stock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == request.ProductId && s.WarehouseId == request.WarehouseId);

            int quantityChange = request.ProcessType switch
            {
                ProcessType.MalKabul => request.Quantity,
                ProcessType.Iade => request.Quantity,
                ProcessType.Zayi => -request.Quantity,
                _ => 0
            };

            if (quantityChange == 0) return new ServiceResponse<bool>("Geçersiz işlem tipi.");

            // 2. Stok Güncelleme
            if (stock == null)
            {
                if (quantityChange < 0) return new ServiceResponse<bool>("Stokta olmayan ürün düşülemez.");

                stock = new Stock { ProductId = request.ProductId, WarehouseId = request.WarehouseId, Quantity = quantityChange };
                await _unitOfWork.Stocks.AddAsync(stock);
            }
            else
            {
                if (stock.Quantity + quantityChange < 0) return new ServiceResponse<bool>("Yetersiz stok.");
                stock.Quantity += quantityChange;
                _unitOfWork.Stocks.Update(stock);
            }

            // 3. Loglama
            var log = new StockLog
            {
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                ChangeAmount = quantityChange,
                ProcessType = request.ProcessType,
                CreatedByUserId = currentUserId,
            };
            await _unitOfWork.StockLogs.AddAsync(log);

            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Stok hareketi işlendi.");
        }
    }
}