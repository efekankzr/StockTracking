using AutoMapper;
using StockTracking.Application.Extensions;
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
            var normalizedName = (request.Name ?? string.Empty).ToNormalizedString();
            var existing = await _unitOfWork.ExpenseCategories.GetSingleAsync(c => c.NormalizedName == normalizedName && !c.IsDeleted);
            if (existing != null) return ServiceResponse<ExpenseCategoryDto>.Fail("Bu isimde bir gider türü zaten mevcut.");

            var category = _mapper.Map<ExpenseCategory>(request);
            category.NormalizedName = normalizedName;

            await _unitOfWork.ExpenseCategories.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResponse<ExpenseCategoryDto>.SuccessResult(_mapper.Map<ExpenseCategoryDto>(category), "Gider türü oluşturuldu.");
        }

        public async Task<ServiceResponse<bool>> DeleteCategoryAsync(int id)
        {
            var category = await _unitOfWork.ExpenseCategories.GetByIdAsync(id);
            if (category == null) return ServiceResponse<bool>.Fail("Kategori bulunamadÄ±.");
            
            if (category.IsSystemDefault) return ServiceResponse<bool>.Fail("Sistem varsayÄ±lanÄ± silinemez.");

            _unitOfWork.ExpenseCategories.Delete(category);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Gider tÃ¼rÃ¼ silindi.");
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
            if (category == null) return ServiceResponse<bool>.Fail("Gider tÃ¼rÃ¼ bulunamadÄ±.");

            // HESAPLAMA (Fixing decimal -> int conversion error)
            decimal baseAmount = 0; // Matrah
            decimal vatAmount = 0;  // KDV
            decimal withholdingAmount = 0; // Stopaj
            decimal totalAmount = request.TotalAmount > 0 ? request.TotalAmount : request.Amount; // Compatibility

            decimal vatRate = request.VatRate ?? 0;
            decimal withholdingRate = request.WithholdingRate ?? 0;

            if (request.IsVatIncluded)
            {
                // KDV Dahilse: Ã–nce KDV'yi iÃ§inden ayÄ±r
                // FormÃ¼l: Tutar / (1 + KDV OranÄ±) = Matrah
                baseAmount = totalAmount / (1 + (vatRate / 100));
                vatAmount = totalAmount - baseAmount;
            }
            else
            {
                // KDV HariÃ§se: Matrah = Tutar
                baseAmount = totalAmount;
                vatAmount = baseAmount * (vatRate / 100);
            }

            // Stopaj Hesaplama (Genelde brÃ¼t Ã¼zerinden veya matrah Ã¼zerinden hesaplanÄ±r, burada matrah kabul edelim)
            if (withholdingRate > 0)
            {
                withholdingAmount = baseAmount * (withholdingRate / 100);
            }

            // Entity oluÅŸturma
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
            if (trans == null) return ServiceResponse<bool>.Fail("KayÄ±t bulunamadÄ±.");

            _unitOfWork.ExpenseTransactions.Delete(trans);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Gider kaydÄ± silindi.");
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
