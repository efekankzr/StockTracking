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

        // --- KATEGORİ İŞLEMLERİ ---
        public async Task<ServiceResponse<List<ExpenseCategoryDto>>> GetAllCategoriesAsync()
        {
            var list = await _unitOfWork.ExpenseCategories.GetAllAsync(); // Repo'ya eklenmeli
            return new ServiceResponse<List<ExpenseCategoryDto>>(_mapper.Map<List<ExpenseCategoryDto>>(list));
        }

        public async Task<ServiceResponse<ExpenseCategoryDto>> CreateCategoryAsync(CreateExpenseCategoryDto request)
        {
            var category = _mapper.Map<ExpenseCategory>(request);
            await _unitOfWork.ExpenseCategories.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<ExpenseCategoryDto>(_mapper.Map<ExpenseCategoryDto>(category), "Gider türü oluşturuldu.");
        }

        public async Task<ServiceResponse<bool>> DeleteCategoryAsync(int id)
        {
            var category = await _unitOfWork.ExpenseCategories.GetByIdAsync(id);
            if (category == null) return new ServiceResponse<bool>("Kategori bulunamadı.");

            if (category.IsSystemDefault) return new ServiceResponse<bool>("Sistem varsayılanı silinemez.");

            _unitOfWork.ExpenseCategories.Delete(category); // Soft Delete
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Gider türü silindi.");
        }

        // --- FİŞ İŞLEMLERİ (GİDER GİRİŞİ) ---
        public async Task<ServiceResponse<List<ExpenseTransactionDto>>> GetAllTransactionsAsync()
        {
            // Detaylı getirmesi için Repo'ya GetAllWithDetailsAsync eklenmeli
            // Şimdilik düz çekip mapliyoruz
            var list = await _unitOfWork.ExpenseTransactions.GetAllAsync();
            // Not: Include işlemleri Repo'da yapılmalı (User, Warehouse, Category)
            return new ServiceResponse<List<ExpenseTransactionDto>>(_mapper.Map<List<ExpenseTransactionDto>>(list));
        }

        public async Task<ServiceResponse<bool>> CreateTransactionAsync(CreateExpenseTransactionDto request, int userId)
        {
            var category = await _unitOfWork.ExpenseCategories.GetByIdAsync(request.ExpenseCategoryId);
            if (category == null) return new ServiceResponse<bool>("Gider türü bulunamadı.");

            // 1. ORANLARI BELİRLE (Kullanıcı girdiyse o, girmediyse kategorinin varsayılanı)
            int vatRate = request.VatRate ?? category.DefaultVatRate;
            int withholdingRate = request.WithholdingRate ?? (category.HasWithholding ? category.DefaultWithholdingRate : 0);

            decimal baseAmount = 0; // Matrah
            decimal vatAmount = 0; // KDV Tutarı
            decimal totalAmount = 0; // Fatura Toplamı

            // 2. HESAPLAMA MOTORU
            if (request.IsVatIncluded)
            {
                // KDV Dahil Girildiyse (Örn: 118 TL, %18 KDV)
                // Matrah = Tutar / (1 + KDV/100) -> 118 / 1.18 = 100
                baseAmount = request.Amount / (1 + ((decimal)vatRate / 100));
                vatAmount = request.Amount - baseAmount;
                totalAmount = request.Amount;
            }
            else
            {
                // KDV Hariç Girildiyse (Örn: 100 TL + KDV)
                baseAmount = request.Amount;
                vatAmount = baseAmount * ((decimal)vatRate / 100);
                totalAmount = baseAmount + vatAmount;
            }

            // Stopaj Hesabı (Genelde Matrah üzerinden hesaplanır)
            decimal withholdingAmount = baseAmount * ((decimal)withholdingRate / 100);

            // 3. KAYIT
            var transaction = new ExpenseTransaction
            {
                ExpenseCategoryId = request.ExpenseCategoryId,
                WarehouseId = request.WarehouseId,
                UserId = userId,
                DocumentNumber = request.DocumentNumber,
                DocumentDate = request.DocumentDate,
                Description = request.Description,

                // Hesaplanan Veriler
                BaseAmount = baseAmount,
                VatRate = vatRate,
                VatAmount = vatAmount,
                WithholdingRate = withholdingRate,
                WithholdingAmount = withholdingAmount,
                TotalAmount = totalAmount,
                IsVatIncludedEntry = request.IsVatIncluded
            };

            await _unitOfWork.ExpenseTransactions.AddAsync(transaction);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, $"Gider kaydedildi. (KDV: {vatAmount:N2}, Stopaj: {withholdingAmount:N2})");
        }

        public async Task<ServiceResponse<bool>> DeleteTransactionAsync(int id)
        {
            var trans = await _unitOfWork.ExpenseTransactions.GetByIdAsync(id);
            if (trans == null) return new ServiceResponse<bool>("Kayıt bulunamadı.");

            _unitOfWork.ExpenseTransactions.Delete(trans); // Soft Delete yoksa Hard Delete yapar
            await _unitOfWork.SaveChangesAsync();
            return new ServiceResponse<bool>(true, "Gider kaydı silindi.");
        }
    }
}