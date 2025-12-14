using AutoMapper;
using StockTracking.Application.DTOs.Expense;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ExpenseService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<ExpenseCategoryDto>>> GetAllCategoriesAsync()
        {
            var list = await _unitOfWork.ExpenseCategories.GetAllAsync();
            var dtos = _mapper.Map<List<ExpenseCategoryDto>>(list);
            return ServiceResponse<List<ExpenseCategoryDto>>.SuccessResult(dtos);
        }

        public async Task<ServiceResponse<ExpenseCategoryDto>> CreateCategoryAsync(CreateExpenseCategoryDto request)
        {
            var category = _mapper.Map<ExpenseCategory>(request);
            await _unitOfWork.ExpenseCategories.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResponse<ExpenseCategoryDto>.SuccessResult(_mapper.Map<ExpenseCategoryDto>(category), "Gider türü oluşturuldu.");
        }

        public async Task<ServiceResponse<bool>> DeleteCategoryAsync(int id)
        {
            var category = await _unitOfWork.ExpenseCategories.GetByIdAsync(id);
            if (category == null) return ServiceResponse<bool>.Fail("Kategori bulunamadı.");
            
            if (category.IsSystemDefault) return ServiceResponse<bool>.Fail("Sistem varsayılanı silinemez.");

            _unitOfWork.ExpenseCategories.Delete(category);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Gider türü silindi.");
        }

        public async Task<ServiceResponse<List<ExpenseTransactionDto>>> GetAllTransactionsAsync()
        {
            var list = await _unitOfWork.ExpenseTransactions.GetAllWithDetailsAsync();
            var dtos = _mapper.Map<List<ExpenseTransactionDto>>(list);
            return ServiceResponse<List<ExpenseTransactionDto>>.SuccessResult(dtos);
        }

        public async Task<ServiceResponse<bool>> CreateTransactionAsync(CreateExpenseTransactionDto request, int userId)
        {
            var category = await _unitOfWork.ExpenseCategories.GetByIdAsync(request.ExpenseCategoryId);
            if (category == null) return ServiceResponse<bool>.Fail("Gider türü bulunamadı.");

            // HESAPLAMA (Fixing decimal -> int conversion error)
            decimal baseAmount = 0; // Matrah
            decimal vatAmount = 0;  // KDV
            decimal withholdingAmount = 0; // Stopaj
            decimal totalAmount = request.TotalAmount > 0 ? request.TotalAmount : request.Amount; // Compatibility

            decimal vatRate = request.VatRate ?? 0;
            decimal withholdingRate = request.WithholdingRate ?? 0;

            if (request.IsVatIncluded)
            {
                // KDV Dahilse: Önce KDV'yi içinden ayır
                // Formül: Tutar / (1 + KDV Oranı) = Matrah
                baseAmount = totalAmount / (1 + (vatRate / 100));
                vatAmount = totalAmount - baseAmount;
            }
            else
            {
                // KDV Hariçse: Matrah = Tutar
                baseAmount = totalAmount;
                vatAmount = baseAmount * (vatRate / 100);
            }

            // Stopaj Hesaplama (Genelde brüt üzerinden veya matrah üzerinden hesaplanır, burada matrah kabul edelim)
            if (withholdingRate > 0)
            {
                withholdingAmount = baseAmount * (withholdingRate / 100);
            }

            // Entity oluşturma
            var transaction = _mapper.Map<ExpenseTransaction>(request);
            transaction.UserId = userId;
            transaction.Amount = baseAmount; 
            transaction.VatAmount = vatAmount;
            transaction.WithholdingAmount = withholdingAmount;
            
            await _unitOfWork.ExpenseTransactions.AddAsync(transaction);
            await _unitOfWork.SaveChangesAsync();
            
            return ServiceResponse<bool>.SuccessResult(true, $"Gider kaydedildi. (KDV: {vatAmount:N2}, Stopaj: {withholdingAmount:N2})");
        }

        public async Task<ServiceResponse<bool>> DeleteTransactionAsync(int id)
        {
            var trans = await _unitOfWork.ExpenseTransactions.GetByIdAsync(id);
            if (trans == null) return ServiceResponse<bool>.Fail("Kayıt bulunamadı.");

            _unitOfWork.ExpenseTransactions.Delete(trans);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Gider kaydı silindi.");
        }

        public async Task<ServiceResponse<List<ExpenseReportDto>>> GetDetailedReportAsync(DateTime startDate, DateTime endDate)
        {
            var transactions = await _unitOfWork.ExpenseTransactions.GetByDateRangeAsync(startDate, endDate);
            
            var report = transactions
                .GroupBy(t => t.ExpenseCategory.Name)
                .Select(g => new ExpenseReportDto
                {
                    CategoryName = g.Key,
                    TotalAmount = g.Sum(x => x.Amount + x.VatAmount), // Toplam tutar
                    TransactionCount = g.Count()
                })
                .ToList();

            return ServiceResponse<List<ExpenseReportDto>>.SuccessResult(report);
        }
    }
}
