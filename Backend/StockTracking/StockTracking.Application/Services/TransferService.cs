using AutoMapper;
using StockTracking.Application.DTOs.Transfer;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;

namespace StockTracking.Application.Services
{
    public class TransferService : ITransferService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TransferService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<TransferDto>>> GetAllAsync()
        {
            var transfers = await _unitOfWork.StockTransfers.GetAllWithDetailsAsync();
            var dtos = _mapper.Map<List<TransferDto>>(transfers);
            return new ServiceResponse<List<TransferDto>>(dtos);
        }

        public async Task<ServiceResponse<List<TransferDto>>> GetByWarehouseIdAsync(int warehouseId)
        {
            var transfers = await _unitOfWork.StockTransfers.GetByWarehouseIdWithDetailsAsync(warehouseId);
            var dtos = _mapper.Map<List<TransferDto>>(transfers);
            return new ServiceResponse<List<TransferDto>>(dtos);
        }

        public async Task<ServiceResponse<bool>> CreateTransferAsync(CreateTransferDto request, int userId)
        {
            var sourceStock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == request.ProductId && s.WarehouseId == request.SourceWarehouseId);

            if (sourceStock == null || sourceStock.Quantity < request.Quantity)
                return new ServiceResponse<bool>("Kaynak depoda yeterli stok yok.");

            var transfer = new StockTransfer
            {
                TransferNumber = "TRF-" + Guid.NewGuid().ToString().Substring(0, 6).ToUpper(),
                SourceWarehouseId = request.SourceWarehouseId,
                TargetWarehouseId = request.TargetWarehouseId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                Status = TransferStatus.Pending,
                CreatedByUserId = userId,
                CreatedDate = DateTime.UtcNow
            };

            sourceStock.Quantity -= request.Quantity;
            _unitOfWork.Stocks.Update(sourceStock);

            await _unitOfWork.StockLogs.AddAsync(new StockLog
            {
                ProductId = request.ProductId,
                WarehouseId = request.SourceWarehouseId,
                ChangeAmount = -request.Quantity,
                ProcessType = ProcessType.TransferCikis,
                CreatedByUserId = userId,
                CreatedDate = DateTime.UtcNow
            });

            await _unitOfWork.StockTransfers.AddAsync(transfer);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Transfer başlatıldı, ürün yola çıktı.");
        }

        public async Task<ServiceResponse<bool>> ApproveTransferAsync(int transferId, int userId)
        {
            var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(transferId);

            if (transfer == null) return new ServiceResponse<bool>("Transfer bulunamadı.");
            if (transfer.Status != TransferStatus.Pending) return new ServiceResponse<bool>("Bu transfer zaten tamamlanmış veya iptal edilmiş.");

            var targetStock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == transfer.ProductId && s.WarehouseId == transfer.TargetWarehouseId);

            if (targetStock == null)
            {
                targetStock = new Stock
                {
                    ProductId = transfer.ProductId,
                    WarehouseId = transfer.TargetWarehouseId,
                    Quantity = 0,
                    AverageCost = 0,
                    LastPurchasePrice = 0
                };
                await _unitOfWork.Stocks.AddAsync(targetStock);
            }

            var sourceStock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == transfer.ProductId && s.WarehouseId == transfer.SourceWarehouseId);
            decimal incomingCost = sourceStock?.AverageCost ?? 0;

            if (incomingCost > 0 && transfer.Quantity > 0)
            {
                decimal currentTotalValue = targetStock.Quantity * targetStock.AverageCost;
                decimal incomingTotalValue = transfer.Quantity * incomingCost;
                int newTotalQuantity = targetStock.Quantity + transfer.Quantity;

                if (newTotalQuantity > 0)
                {
                    targetStock.AverageCost = (currentTotalValue + incomingTotalValue) / newTotalQuantity;
                }
            }

            targetStock.Quantity += transfer.Quantity;
            _unitOfWork.Stocks.Update(targetStock);

            transfer.Status = TransferStatus.Approved;
            transfer.ApprovedByUserId = userId;
            transfer.ApprovedDate = DateTime.UtcNow;
            _unitOfWork.StockTransfers.Update(transfer);

            await _unitOfWork.StockLogs.AddAsync(new StockLog
            {
                ProductId = transfer.ProductId,
                WarehouseId = transfer.TargetWarehouseId,
                ChangeAmount = transfer.Quantity,
                ProcessType = ProcessType.TransferGiris,
                CreatedByUserId = userId,
                CreatedDate = DateTime.UtcNow,
                InboundPrice = incomingCost
            });

            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Transfer onaylandı, stok hedef depoya eklendi.");
        }

        public async Task<ServiceResponse<bool>> CancelTransferAsync(int transferId, int userId)
        {
            var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(transferId);

            if (transfer == null) return new ServiceResponse<bool>("Transfer bulunamadı.");
            if (transfer.Status != TransferStatus.Pending) return new ServiceResponse<bool>("Sadece beklemedeki transferler iptal edilebilir.");

            var sourceStock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == transfer.ProductId && s.WarehouseId == transfer.SourceWarehouseId);

            if (sourceStock != null)
            {
                sourceStock.Quantity += transfer.Quantity;
                _unitOfWork.Stocks.Update(sourceStock);
            }

            transfer.Status = TransferStatus.Cancelled;
            _unitOfWork.StockTransfers.Update(transfer);

            await _unitOfWork.StockLogs.AddAsync(new StockLog
            {
                ProductId = transfer.ProductId,
                WarehouseId = transfer.SourceWarehouseId,
                ChangeAmount = transfer.Quantity,
                ProcessType = ProcessType.TransferIptal,
                CreatedByUserId = userId,
                CreatedDate = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Transfer iptal edildi, stok kaynağa iade edildi.");
        }
    }
}