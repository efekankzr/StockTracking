using AutoMapper;
using StockTracking.Application.DTOs.Sale;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;

namespace StockTracking.Application.Services
{
    public class SaleService : ISaleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SaleService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<SaleDto>>> GetAllSalesAsync()
        {
            var sales = await _unitOfWork.Sales.GetAllAsync();
            return new ServiceResponse<List<SaleDto>>(_mapper.Map<List<SaleDto>>(sales));
        }

        public async Task<ServiceResponse<SaleDto>> CreateSaleAsync(CreateSaleDto request, int userId)
        {
            // 1. Ürün ve Fiyat Bilgisi
            var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId);
            if (product == null) return new ServiceResponse<SaleDto>("Ürün bulunamadı.");

            // 2. Stok Kontrolü (Hangi Depo?)
            var stock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == request.ProductId && s.WarehouseId == request.WarehouseId);
            if (stock == null || stock.Quantity < request.Quantity)
                return new ServiceResponse<SaleDto>($"Yetersiz stok! Mevcut: {stock?.Quantity ?? 0}");

            // 3. Satış Kaydı (Snapshot)
            var sale = new Sale
            {
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId, // YENİ EKLENDİ
                UserId = userId,
                Quantity = request.Quantity,
                TransactionDate = DateTime.Now,
                PaymentMethod = request.PaymentMethod,

                // Snapshot Fiyatlar
                SnapshotPurchasePrice = product.PurchasePrice,
                SnapshotSalePrice = product.SalePrice,
                SnapshotTaxBuying = product.TaxRateBuying,
                SnapshotTaxSelling = product.TaxRateSelling
            };

            await _unitOfWork.Sales.AddAsync(sale);

            // 4. Stok Düşüşü
            stock.Quantity -= request.Quantity;
            _unitOfWork.Stocks.Update(stock);

            // 5. Loglama (Satış Olarak)
            var log = new StockLog
            {
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                ChangeAmount = -request.Quantity,
                ProcessType = ProcessType.Satis,
                CreatedByUserId = userId,
                // RelatedSaleId = sale.Id (Transaction içinde ID oluşmazsa loglamada null kalabilir, EF Core bunu sonra çözebilir)
            };
            await _unitOfWork.StockLogs.AddAsync(log);

            // 6. Kaydet
            await _unitOfWork.SaveChangesAsync();

            var responseDto = _mapper.Map<SaleDto>(sale);
            responseDto.ProductName = product.Name; // Manuel set etmek garanti olur

            return new ServiceResponse<SaleDto>(responseDto, "Satış yapıldı.");
        }
    }
}