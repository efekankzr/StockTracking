using FluentAssertions;
using Moq;
using StockTracking.Application.DTOs.Stock;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;
using AutoMapper;
using System.Linq.Expressions;
using Xunit;

namespace StockTracking.Tests.Services
{
    public class StockServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IStockRepository> _mockStockRepository;
        private readonly Mock<IStockLogRepository> _mockStockLogRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly StockService _stockService;

        public StockServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockStockRepository = new Mock<IStockRepository>();
            _mockStockLogRepository = new Mock<IStockLogRepository>();
            _mockMapper = new Mock<IMapper>();

            _mockUnitOfWork.Setup(u => u.Stocks).Returns(_mockStockRepository.Object);
            _mockUnitOfWork.Setup(u => u.StockLogs).Returns(_mockStockLogRepository.Object);

            _stockService = new StockService(_mockUnitOfWork.Object, _mockMapper.Object);
        }

        [Fact]
        public async Task CreateStockEntryAsync_ShouldCreateNewStock_WhenStockDoesNotExist()
        {
            // Arrange
            var createDto = new CreateStockEntryDto
            {
                ProductId = 1,
                WarehouseId = 1,
                Quantity = 10,
                UnitPrice = 100,
                ProcessType = ProcessType.MalKabul
            };

            _mockStockRepository.Setup(r => r.GetSingleAsync(It.IsAny<Expression<Func<Stock, bool>>>()))
                .ReturnsAsync((Stock?)null);

            var stock = new Stock { Quantity = 0, AverageCost = 0 };
            _mockStockRepository.Setup(r => r.AddAsync(It.IsAny<Stock>()))
                .Callback<Stock>(s => stock = s)
                .Returns(Task.CompletedTask);
            
            _mockStockLogRepository.Setup(r => r.AddAsync(It.IsAny<StockLog>()))
               .Returns(Task.CompletedTask);

            // Act
            var result = await _stockService.CreateStockEntryAsync(createDto, 1);

            // Assert
            result.Success.Should().BeTrue();
            stock.Quantity.Should().Be(10);
            stock.LastPurchasePrice.Should().Be(100);
            _mockStockRepository.Verify(r => r.AddAsync(It.IsAny<Stock>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateStockEntryAsync_ShouldUpdateAverageCost_WhenNewStockAdded()
        {
            // Arrange
            var createDto = new CreateStockEntryDto
            {
                ProductId = 1,
                WarehouseId = 1,
                Quantity = 10,
                UnitPrice = 200,
                ProcessType = ProcessType.MalKabul
            };

            var existingStock = new Stock
            {
                ProductId = 1,
                WarehouseId = 1,
                Quantity = 10,
                AverageCost = 100
            };

            _mockStockRepository.Setup(r => r.GetSingleAsync(It.IsAny<Expression<Func<Stock, bool>>>()))
                .ReturnsAsync(existingStock);

             _mockStockLogRepository.Setup(r => r.AddAsync(It.IsAny<StockLog>()))
               .Returns(Task.CompletedTask);

            // Act
            var result = await _stockService.CreateStockEntryAsync(createDto, 1);

            // Assert
            result.Success.Should().BeTrue();
            existingStock.Quantity.Should().Be(20);
            existingStock.AverageCost.Should().Be(150);
            existingStock.LastPurchasePrice.Should().Be(200);
        }

        [Fact]
        public async Task CreateStockEntryAsync_ShouldFail_WhenInsufficientStockDuringZayi()
        {
            // Arrange
            var createDto = new CreateStockEntryDto
            {
                ProductId = 1,
                WarehouseId = 1,
                Quantity = 50,
                ProcessType = ProcessType.Zayi
            };

            var existingStock = new Stock
            {
                ProductId = 1,
                WarehouseId = 1,
                Quantity = 10
            };

            _mockStockRepository.Setup(r => r.GetSingleAsync(It.IsAny<Expression<Func<Stock, bool>>>()))
                .ReturnsAsync(existingStock);

            // Act
            var result = await _stockService.CreateStockEntryAsync(createDto, 1);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Contain("Yetersiz stok");
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Never);
        }

         [Fact]
        public async Task CreateStockEntryAsync_ShouldDecreaseStock_WhenZayi()
        {
            // Arrange
            var createDto = new CreateStockEntryDto
            {
                ProductId = 1,
                WarehouseId = 1,
                Quantity = 5,
                ProcessType = ProcessType.Zayi
            };

            var existingStock = new Stock
            {
                ProductId = 1,
                WarehouseId = 1,
                Quantity = 10
            };

            _mockStockRepository.Setup(r => r.GetSingleAsync(It.IsAny<Expression<Func<Stock, bool>>>()))
                .ReturnsAsync(existingStock);
             _mockStockLogRepository.Setup(r => r.AddAsync(It.IsAny<StockLog>()))
               .Returns(Task.CompletedTask);

            // Act
            var result = await _stockService.CreateStockEntryAsync(createDto, 1);

            // Assert
            result.Success.Should().BeTrue();
            existingStock.Quantity.Should().Be(5);
             _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }
    }
}
