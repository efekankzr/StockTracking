using AutoMapper;
using Microsoft.AspNetCore.Identity;
using StockTracking.Application.DTOs.Report;
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
        private readonly UserManager<User> _userManager;

        public SaleService(IUnitOfWork unitOfWork, IMapper mapper, UserManager<User> userManager)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<ServiceResponse<List<SaleDto>>> GetAllSalesAsync()
        {
            var sales = await _unitOfWork.Sales.GetAllAsync();
            return new ServiceResponse<List<SaleDto>>(_mapper.Map<List<SaleDto>>(sales));
        }

        public async Task<ServiceResponse<SaleDto>> CreateSaleAsync(CreateSaleDto request, int userId)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId);
            if (product == null) return new ServiceResponse<SaleDto>("Ürün bulunamadı.");

            var stock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == request.ProductId && s.WarehouseId == request.WarehouseId);
            if (stock == null || stock.Quantity < request.Quantity)
                return new ServiceResponse<SaleDto>($"Yetersiz stok! Mevcut: {stock?.Quantity ?? 0}");

            var sale = new Sale
            {
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                UserId = userId,
                Quantity = request.Quantity,
                TransactionDate = DateTime.Now,
                PaymentMethod = request.PaymentMethod,

                SnapshotPurchasePrice = product.PurchasePrice,
                SnapshotSalePrice = product.SalePrice,
                SnapshotTaxBuying = product.TaxRateBuying,
                SnapshotTaxSelling = product.TaxRateSelling
            };

            await _unitOfWork.Sales.AddAsync(sale);

            stock.Quantity -= request.Quantity;
            _unitOfWork.Stocks.Update(stock);

            var log = new StockLog
            {
                ProductId = request.ProductId,
                WarehouseId = request.WarehouseId,
                ChangeAmount = -request.Quantity,
                ProcessType = ProcessType.Satis,
                CreatedByUserId = userId,
            };
            await _unitOfWork.StockLogs.AddAsync(log);

            // 6. Kaydet
            await _unitOfWork.SaveChangesAsync();

            var responseDto = _mapper.Map<SaleDto>(sale);
            responseDto.ProductName = product.Name; // Manuel set etmek garanti olur

            return new ServiceResponse<SaleDto>(responseDto, "Satış yapıldı.");
        }
        public async Task<ServiceResponse<List<UserSalesReportDto>>> GetDailyReportAsync(DateTime date)
        {
            var sales = await _unitOfWork.Sales.GetWhereAsync(x => x.TransactionDate.Date == date.Date);
            var dailySales = await ((ISaleRepository)_unitOfWork.Sales).GetSalesByDateAsync(date);
            var report = await SALES_TO_REPORT_CONVERTER(dailySales);
            return new ServiceResponse<List<UserSalesReportDto>>(report);
        }

        private async Task<List<UserSalesReportDto>> SALES_TO_REPORT_CONVERTER(IEnumerable<Sale> sales)
        {
            var reportList = sales
                .GroupBy(s => s.User)
                .Select(g => new UserSalesReportDto
                {
                    UserId = g.Key.Id,
                    FullName = g.Key.FullName,
                    Role = "Yükleniyor...",
                    TotalQuantity = g.Sum(s => s.Quantity),
                    TotalAmount = g.Sum(s => s.Quantity * s.SnapshotSalePrice),
                    Sales = g.Select(s => new SaleDetailDto
                    {
                        SaleId = s.Id,
                        ProductName = s.Product.Name,
                        Barcode = s.Product.Barcode,
                        Quantity = s.Quantity,
                        UnitPrice = s.SnapshotSalePrice,
                        TotalAmount = s.Quantity * s.SnapshotSalePrice,
                        Time = s.TransactionDate
                    }).ToList()
                })
                .ToList();

            foreach (var item in reportList)
            {
                var user = await _userManager.FindByIdAsync(item.UserId.ToString());
                if (user != null)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    item.Role = roles.FirstOrDefault() ?? "Personel";
                }
            }

            return reportList.OrderByDescending(x => x.TotalAmount).ToList();
        }
    }
}