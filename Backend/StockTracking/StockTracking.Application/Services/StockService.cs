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
            var stock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == request.ProductId && s.WarehouseId == request.WarehouseId);

            if (stock == null)
            {
                stock = new Stock
                {
                    ProductId = request.ProductId,
                    WarehouseId = request.WarehouseId,
                    Quantity = 0,
                    AverageCost = 0,
                    LastPurchasePrice = 0
                };
                await _unitOfWork.Stocks.AddAsync(stock);
            }

            int quantityChange = 0;
            decimal incomingPrice = request.UnitPrice ?? 0;

            switch (request.ProcessType)
            {
                case ProcessType.MalKabul:
                    quantityChange = request.Quantity;

                    if (request.UnitPrice.HasValue && request.Quantity > 0)
                    {
                        // Ağırlıklı Ortalama Maliyet Hesabı
                        decimal currentTotalValue = stock.Quantity * stock.AverageCost;
                        decimal incomingTotalValue = request.Quantity * incomingPrice;
                        int newTotalQuantity = stock.Quantity + request.Quantity;

                        if (newTotalQuantity > 0)
                        {
                            stock.AverageCost = (currentTotalValue + incomingTotalValue) / newTotalQuantity;
                        }

                        // Son Alış Fiyatı
                        stock.LastPurchasePrice = incomingPrice;
                    }
                    break;

                case ProcessType.Iade:
                    quantityChange = request.Quantity;
                    break;

                case ProcessType.Zayi:
                    quantityChange = -request.Quantity;
                    break;

                default:
                    return new ServiceResponse<bool>("Geçersiz işlem tipi.");
            }

            if (stock.Quantity + quantityChange < 0)
                return new ServiceResponse<bool>($"Yetersiz stok! Mevcut: {stock.Quantity}");

            stock.Quantity += quantityChange;
            _unitOfWork.Stocks.Update(stock);

            var log = new StockLog
            {
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                ChangeAmount = quantityChange,
                ProcessType = request.ProcessType,
                CreatedByUserId = currentUserId,
                CreatedDate = DateTime.UtcNow,

                InboundPrice = request.ProcessType == ProcessType.MalKabul ? request.UnitPrice : null,
                InboundTaxRate = request.ProcessType == ProcessType.MalKabul ? request.TaxRate : null
            };
            await _unitOfWork.StockLogs.AddAsync(log);

            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Stok hareketi işlendi.");
        }
    }
}