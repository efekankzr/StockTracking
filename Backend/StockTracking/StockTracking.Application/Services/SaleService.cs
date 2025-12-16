using AutoMapper;
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

        public SaleService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<SaleDto>>> GetAllSalesAsync()
        {
            var sales = await _unitOfWork.Sales.GetAllWithItemsAsync();
            var result = _mapper.Map<List<SaleDto>>(sales);
            return ServiceResponse<List<SaleDto>>.SuccessResult(result);
        }

        public async Task<ServiceResponse<SaleDto>> CreateSaleAsync(CreateSaleDto request, int userId)
        {
            if (request.Items == null || !request.Items.Any())
                return ServiceResponse<SaleDto>.Fail("Satış kalemleri boş olamaz.");

            var sale = new Sale
            {
                WarehouseId = request.WarehouseId,
                UserId = userId,
                ActualSalesPersonId = request.ActualSalesPersonId,
                TransactionDate = DateTime.UtcNow,
                TransactionNumber = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                PaymentMethod = (PaymentMethod)request.PaymentMethod,
                SaleItems = new List<SaleItem>()
            };

            decimal grandTotal = 0;

            foreach (var itemDto in request.Items)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(itemDto.ProductId);
                if (product == null) return ServiceResponse<SaleDto>.Fail($"Ürün bulunamadı (ID: {itemDto.ProductId})");

                // STOK KONTROLÜ VE MALİYET ALMA
                var stock = await _unitOfWork.Stocks.GetSingleAsync(s => s.ProductId == itemDto.ProductId && s.WarehouseId == request.WarehouseId);
                if (stock == null) return ServiceResponse<SaleDto>.Fail($"Stok bulunamadı! (Ürün ID: {itemDto.ProductId})");
                
                if (stock.Quantity < itemDto.Quantity)
                    return ServiceResponse<SaleDto>.Fail($"Yetersiz stok! (Ürün: {product.Name}, Mevcut: {stock.Quantity}, İstenen: {itemDto.Quantity})");

                var saleItem = new SaleItem
                {
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitCost = stock.AverageCost // DÜZELTME: Artık stok maliyetini kullanıyor.
                };
                
                if(itemDto.UnitPrice.HasValue)
                {
                    saleItem.UnitPrice = itemDto.UnitPrice.Value;
                }
                else 
                {
                    saleItem.UnitPrice = product.SalePrice;
                }

                grandTotal += saleItem.UnitPrice * saleItem.Quantity;
                sale.SaleItems.Add(saleItem);

                // STOK DÜŞME
                stock.Quantity -= itemDto.Quantity;
                _unitOfWork.Stocks.Update(stock);
            }
            
            sale.TotalAmount = grandTotal;

            await _unitOfWork.Sales.AddAsync(sale);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResponse<SaleDto>.SuccessResult(_mapper.Map<SaleDto>(sale), "Satış başarıyla oluşturuldu.");
        }

        public async Task<ServiceResponse<List<UserSalesReportDto>>> GetDailyReportAsync(DateTime date)
        {
            var sales = await _unitOfWork.Sales.GetSalesByDateAsync(date);
            
            var report = sales.GroupBy(x => x.ActualSalesPersonId ?? x.UserId)
                .Select(g => {
                    var user = g.First().ActualSalesPerson ?? g.First().User;
                    var totalRevenue = g.Sum(x => x.TotalAmount);
                    var totalCost = g.SelectMany(x => x.SaleItems).Sum(si => si.UnitCost * si.Quantity);

                    return new UserSalesReportDto
                    {
                        UserId = g.Key,
                        FullName = user?.FullName ?? "Bilinmeyen Kullanıcı",
                        Role = "Personel",
                        TotalQuantity = g.SelectMany(x => x.SaleItems).Sum(si => si.Quantity),
                        TotalAmount = totalRevenue,
                        TotalCost = totalCost,
                        TotalProfit = totalRevenue - totalCost,
                        ProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
                        Sales = g.SelectMany(x => x.SaleItems.Select(si => new SaleDetailDto {
                            SaleId = x.Id,
                            ProductName = si.Product?.Name,
                            Barcode = si.Product?.Barcode,
                            Quantity = si.Quantity,
                            Time = x.TransactionDate,
                            UnitPrice = si.UnitPrice,
                            TotalAmount = si.Quantity * si.UnitPrice,
                            UnitCost = si.UnitCost,
                            Profit = (si.UnitPrice - si.UnitCost) * si.Quantity
                        })).ToList()
                    };
                }).ToList();

            return ServiceResponse<List<UserSalesReportDto>>.SuccessResult(report);
        }

        public async Task<ServiceResponse<List<UserSalesReportDto>>> GetMonthlyReportAsync(int year, int month)
        {
            // O ayın başı ve sonunu belirle
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            // O tarih aralığındaki satışları çek (GetSalesByDateRangeAsync metodunu varsayıyoruz veya GetAll'dan filtreliyoruz)
            // Performans için repository'ye tarih aralığı metodu eklenmesi idealdir ama şimdilik GetAll veya mevcut metotları kullanalım.
            // Eğer repository'de sadece Date varsa, GetAll yapıp bellekte filtreleyebiliriz (Veri az ise)
            // VEYA UnitOfWork içerisinde Sales repository'sinde tarih aralığı desteği var mı kontrol edelim.
            // Mevcut kodda GetSalesByDateAsync var (tam eşitlik).
            
            // Veri çoksa bu yöntem yavaştır ama şimdilik hızlı çözüm için:
            var allSales = await _unitOfWork.Sales.GetAllWithItemsAsync();
            var sales = allSales.Where(s => s.TransactionDate.Year == year && s.TransactionDate.Month == month).ToList();

            var report = sales.GroupBy(x => x.ActualSalesPersonId ?? x.UserId)
                .Select(g => {
                    var user = g.First().ActualSalesPerson ?? g.First().User;
                    var totalRevenue = g.Sum(x => x.TotalAmount);
                    var totalCost = g.SelectMany(x => x.SaleItems).Sum(si => si.UnitCost * si.Quantity);

                    return new UserSalesReportDto
                    {
                        UserId = g.Key,
                        FullName = user?.FullName ?? "Bilinmeyen Kullanıcı",
                        Role = "Personel",
                        TotalQuantity = g.SelectMany(x => x.SaleItems).Sum(si => si.Quantity),
                        TotalAmount = totalRevenue,
                        TotalCost = totalCost,
                        TotalProfit = totalRevenue - totalCost,
                        ProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
                        Sales = g.SelectMany(x => x.SaleItems.Select(si => new SaleDetailDto {
                            SaleId = x.Id,
                            ProductName = si.Product?.Name,
                            Barcode = si.Product?.Barcode,
                            Quantity = si.Quantity,
                            Time = x.TransactionDate,
                            UnitPrice = si.UnitPrice,
                            TotalAmount = si.Quantity * si.UnitPrice,
                            UnitCost = si.UnitCost,
                            Profit = (si.UnitPrice - si.UnitCost) * si.Quantity
                        })).ToList()
                    };
                }).ToList();

            return ServiceResponse<List<UserSalesReportDto>>.SuccessResult(report);
        }

        public async Task<ServiceResponse<DashboardSummaryDto>> GetDashboardSummaryAsync()
        {
            // Veritabanından verilerin çekilmesi
            var sales = await _unitOfWork.Sales.GetAllAsync();
            var stocks = await _unitOfWork.Stocks.GetAllAsync();
            var users = await _unitOfWork.Users.GetAllAsync();
            var latestSales = await _unitOfWork.Sales.GetLatestSalesAsync(10);

            var summary = new DashboardSummaryDto
            {
                TotalRevenue = sales.Sum(x => x.TotalAmount),
                DailyRevenue = sales.Where(x => x.TransactionDate.Date == DateTime.Today).Sum(x => x.TotalAmount),
                MonthlyRevenue = sales.Where(x => x.TransactionDate.Month == DateTime.Today.Month && x.TransactionDate.Year == DateTime.Today.Year).Sum(x => x.TotalAmount),
                TotalStockQuantity = stocks.Sum(x => x.Quantity),
                TotalEmployees = users.Count,
                LatestSales = latestSales.Select(s => new LatestTransactionDto {
                    Id = s.Id,
                    TransactionNumber = s.TransactionNumber,
                    Date = s.TransactionDate,
                    SalesPerson = s.ActualSalesPerson?.FullName ?? s.User?.FullName,
                    Warehouse = s.Warehouse?.Name,
                    Amount = s.TotalAmount
                }).ToList()
            };

            return ServiceResponse<DashboardSummaryDto>.SuccessResult(summary);
        }
    }
}
