using FluentAssertions;
using Moq;
using StockTracking.Application.DTOs.Expense;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Services;
using StockTracking.Domain.Entities;
using AutoMapper;
using System.Linq.Expressions;
using Xunit;

namespace StockTracking.Tests.Services
{
    public class ExpenseServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IExpenseTransactionRepository> _mockTransactionRepo;
        private readonly Mock<IExpenseCategoryRepository> _mockCategoryRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly ExpenseService _expenseService;

        public ExpenseServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockTransactionRepo = new Mock<IExpenseTransactionRepository>();
            _mockCategoryRepo = new Mock<IExpenseCategoryRepository>();
            _mockMapper = new Mock<IMapper>();

            _mockUnitOfWork.Setup(u => u.ExpenseTransactions).Returns(_mockTransactionRepo.Object);
            _mockUnitOfWork.Setup(u => u.ExpenseCategories).Returns(_mockCategoryRepo.Object);

            _expenseService = new ExpenseService(_mockUnitOfWork.Object, _mockMapper.Object);
        }

        [Fact]
        public async Task GetDetailedReportAsync_ShouldReturnCorrectSums_WhenTransactionsExist()
        {
            // Arrange
            var transactions = new List<ExpenseTransaction>
            {
                new ExpenseTransaction { ExpenseCategoryId = 1, TotalAmount = 100, VatAmount = 10, BaseAmount = 90 },
                new ExpenseTransaction { ExpenseCategoryId = 1, TotalAmount = 200, VatAmount = 20, BaseAmount = 180 },
                new ExpenseTransaction { ExpenseCategoryId = 2, TotalAmount = 500, VatAmount = 50, BaseAmount = 450 }
            };

            var categories = new List<ExpenseCategory>
            {
                new ExpenseCategory { Id = 1, Name = "Yemek" },
                new ExpenseCategory { Id = 2, Name = "Kira" }
            };

            _mockTransactionRepo.Setup(r => r.GetWhereAsync(It.IsAny<Expression<Func<ExpenseTransaction, bool>>>()))
                .ReturnsAsync(transactions);

            _mockCategoryRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(categories);

            // Act
            var result = await _expenseService.GetDetailedReportAsync(DateTime.Now.AddDays(-1), DateTime.Now);

            // Assert
            result.Data.Should().HaveCount(2);

            var yemekReport = result.Data.First(r => r.CategoryName == "Yemek");
            yemekReport.TotalAmount.Should().Be(300);
            yemekReport.TotalVat.Should().Be(30);
            yemekReport.TransactionCount.Should().Be(2);

             var kiraReport = result.Data.First(r => r.CategoryName == "Kira");
            kiraReport.TotalAmount.Should().Be(500);
        }

        [Fact]
        public async Task CreateTransactionAsync_ShouldCalculateCorrectly_WhenVatIncluded()
        {
             // Arrange
            var createDto = new CreateExpenseTransactionDto
            {
                ExpenseCategoryId = 1,
                Amount = 118,
                IsVatIncluded = true,
                VatRate = 18
            };

            var category = new ExpenseCategory { Id = 1, DefaultVatRate = 18 };
            _mockCategoryRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(category);

            ExpenseTransaction createdTransaction = null;
            _mockTransactionRepo.Setup(r => r.AddAsync(It.IsAny<ExpenseTransaction>()))
                .Callback<ExpenseTransaction>(t => createdTransaction = t)
                .Returns(Task.CompletedTask);

             // Act
             await _expenseService.CreateTransactionAsync(createDto, 1);

             // Assert
             createdTransaction.Should().NotBeNull();
             createdTransaction.BaseAmount.Should().Be(100);
             createdTransaction.VatAmount.Should().Be(18);
             createdTransaction.TotalAmount.Should().Be(118);
        }
    }
}
