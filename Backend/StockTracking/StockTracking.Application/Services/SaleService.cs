using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
            var sale = new Sale
            {
                TransactionNumber = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                TransactionDate = DateTime.Now,
                UserId = userId,
                ActualSalesPersonId = request.ActualSalesPersonId ?? userId,
                WarehouseId = request.WarehouseId,
                PaymentMethod = request.PaymentMethod,
                TotalAmount = 0,
                TotalVatAmount = 0,
                SaleItems = new List<SaleItem>()
            };

        

            foreach (var itemDto in request.Items)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(itemDto.ProductId);
                if (product == null) return new ServiceResponse<SaleDto>($"Ürün bulunamadý (ID: {itemDto.ProductId})");

                var stock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == itemDto.ProductId && s.WarehouseId == request.WarehouseId);
                if (stock == null || stock.Quantity < itemDto.Quantity)
                    return new ServiceResponse<SaleDto>($"{product.Name} için yetersiz stok!");

                decimal priceWithVat = itemDto.PriceWithVat ?? product.SalePrice;
                decimal vatRate = itemDto.VatRate ?? product.TaxRateSelling;

                if (request.PaymentMethod == PaymentMethod.KrediKarti && vatRate == 0)
                    return ServiceResponse<SaleDto>.Fail("Kredi kartý ile satýþta KDV 0 olamaz!");

                decimal netPrice = priceWithVat / (1 + (vatRate / 100));
                decimal vatPerUnit = priceWithVat - netPrice;
                decimal lineTotal = priceWithVat * itemDto.Quantity;
                decimal lineTotalVat = vatPerUnit * itemDto.Quantity;

                var saleItem = new SaleItem
                {
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitCost = stock.AverageCost,
                    UnitPrice = priceWithVat,
                    VatRate = vatRate,
                    VatAmount = lineTotalVat
                };

                sale.SaleItems.Add(saleItem);
                sale.TotalAmount += lineTotal;
                sale.TotalVatAmount += lineTotalVat;

                stock.Quantity -= itemDto.Quantity;
                _unitOfWork.Stocks.Update(stock);

                var log = new StockLog
                {
                    ProductId = itemDto.ProductId,
                    WarehouseId = request.WarehouseId,
                    ChangeAmount = -itemDto.Quantity,
                    ProcessType = ProcessType.Satis,
                    CreatedByUserId = userId,
                    CreatedDate = DateTime.Now
                };
                await _unitOfWork.StockLogs.AddAsync(log);
            }

            await _unitOfWork.Sales.AddAsync(sale);
            await _unitOfWork.SaveChangesAsync();

            var responseDto = _mapper.Map<SaleDto>(sale);
            return new ServiceResponse<SaleDto>(responseDto, $"Satýþ baþarýlý. Toplam: {sale.TotalAmount:C2}");
        }

        public async Task<ServiceResponse<List<UserSalesReportDto>>> GetDailyReportAsync(DateTime date)
        {
            var allUsers = await _userManager.Users.ToListAsync();
            var dailySales = await ((ISaleRepository)_unitOfWork.Sales).GetSalesByDateAsync(date);

            var reportList = new List<UserSalesReportDto>();

            foreach (var user in allUsers)
            {
                var userSales = dailySales.Where(s => s.ActualSalesPersonId == user.Id).ToList();
                var userRole = (await _userManager.GetRolesAsync(user)).FirstOrDefault() ?? "Personel";

                var salesDetails = userSales.SelectMany(s => s.SaleItems.Select(i =>
                {
                    decimal unitCost = i.UnitCost;
                    decimal profit = (i.UnitPrice - unitCost) * i.Quantity;

                    return new SaleDetailDto
                    {
                        SaleId = s.Id,
                        ProductName = i.Product.Name,
                        Barcode = i.Product.Barcode,
                        Quantity = i.Quantity,
                        Time = s.TransactionDate,

                        UnitPrice = i.UnitPrice,
                        TotalAmount = i.Quantity * i.UnitPrice,

                        UnitCost = unitCost,
                        Profit = profit
                    };
                })).OrderByDescending(x => x.Time).ToList();

                var reportItem = new UserSalesReportDto
                {
                    UserId = user.Id,
                    FullName = user.FullName,
                    Role = userRole,

                    TotalQuantity = salesDetails.Sum(x => x.Quantity),
                    TotalAmount = salesDetails.Sum(x => x.TotalAmount),
                    TotalCost = salesDetails.Sum(x => x.UnitCost * x.Quantity),
                    TotalProfit = salesDetails.Sum(x => x.Profit),
                    ProfitMargin = 0,
                    Sales = salesDetails
                };

                if (reportItem.TotalAmount > 0)
                {
                    reportItem.ProfitMargin = (reportItem.TotalProfit / reportItem.TotalAmount) * 100;
                }

                reportList.Add(reportItem);
            }

            return new ServiceResponse<List<UserSalesReportDto>>(reportList.OrderByDescending(x => x.TotalAmount).ToList());
        }

        public async Task<ServiceResponse<DashboardSummaryDto>> GetDashboardSummaryAsync()
        {
            var summary = new DashboardSummaryDto();
            var today = DateTime.Today;

            var allSales = await _unitOfWork.Sales.GetAllAsync();

            summary.TotalRevenue = allSales.Sum(s => s.TotalAmount);

            summary.DailyRevenue = allSales
                .Where(s => s.TransactionDate.Date == today)
                .Sum(s => s.TotalAmount);

            summary.MonthlyRevenue = allSales
                .Where(s => s.TransactionDate.Month == today.Month && s.TransactionDate.Year == today.Year)
                .Sum(s => s.TotalAmount);

            var stocks = await _unitOfWork.Stocks.GetAllAsync();
            summary.TotalStockQuantity = stocks.Sum(s => s.Quantity);

            summary.TotalEmployees = await _userManager.Users.CountAsync(u => u.UserName != "sysadmin");

            var lastSales = await ((ISaleRepository)_unitOfWork.Sales).GetLatestSalesAsync(5);

            summary.LatestSales = lastSales.Select(s => new LatestTransactionDto
            {
                Id = s.Id,
                TransactionNumber = s.TransactionNumber,
                Date = s.TransactionDate,
                SalesPerson = s.ActualSalesPerson?.FullName ?? s.User.FullName,
                Warehouse = s.Warehouse.Name,
                Amount = s.TotalAmount
            }).ToList();

            return new ServiceResponse<DashboardSummaryDto>(summary);
        }
    }
}
