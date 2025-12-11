using FluentAssertions;
using Moq;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Services;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using System.Linq.Expressions;
using Xunit;
using StockTracking.Application.Mapping;

namespace StockTracking.Tests.Services
{
    public class WarehouseServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IWarehouseRepository> _mockWarehouseRepo;
        private readonly Mock<IProductRepository> _mockProductRepo;
        private readonly Mock<IStockRepository> _mockStockRepo;
        private readonly Mock<UserManager<User>> _mockUserManager;
        private readonly Mock<RoleManager<IdentityRole<int>>> _mockRoleManager;
        private readonly IMapper _mapper;
        private readonly WarehouseService _warehouseService;

        public WarehouseServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockWarehouseRepo = new Mock<IWarehouseRepository>();
            _mockProductRepo = new Mock<IProductRepository>();
            _mockStockRepo = new Mock<IStockRepository>();

            _mockUnitOfWork.Setup(u => u.Warehouses).Returns(_mockWarehouseRepo.Object);
            _mockUnitOfWork.Setup(u => u.Products).Returns(_mockProductRepo.Object);
            _mockUnitOfWork.Setup(u => u.Stocks).Returns(_mockStockRepo.Object);

             // Setup Mapper
            var config = new MapperConfiguration(cfg => {
                cfg.AddProfile<GeneralMapping>();
                cfg.AddProfile<GeneralMapping>(); // Duplicate checking? No just careful.
            });
            _mapper = config.CreateMapper();

            // Mock UserManager & RoleManager (Tricky needing Stores)
            var userStore = new Mock<IUserStore<User>>();
            _mockUserManager = new Mock<UserManager<User>>(userStore.Object, null, null, null, null, null, null, null, null);

            var roleStore = new Mock<IRoleStore<IdentityRole<int>>>();
            _mockRoleManager = new Mock<RoleManager<IdentityRole<int>>>(roleStore.Object, null, null, null, null);

            // Mock Identity Results
            _mockUserManager.Setup(u => u.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);
            
            _mockRoleManager.Setup(r => r.RoleExistsAsync(It.IsAny<string>()))
                .ReturnsAsync(true);
            
            _mockUserManager.Setup(u => u.AddToRoleAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);

            _warehouseService = new WarehouseService(_mockUnitOfWork.Object, _mapper, _mockUserManager.Object, _mockRoleManager.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldSetStopaj20_WhenRentTypeIsSahis()
        {
            // Arrange
            var createDto = new CreateWarehouseDto
            {
                Name = "Test Depo",
                RentType = (int)RentType.Sahis,
                OfficialRentAmount = 30000,
                UnofficialRentAmount = 20000
            };

            Warehouse createdWarehouse = null;
            _mockWarehouseRepo.Setup(r => r.GetSingleAsync(It.IsAny<Expression<Func<Warehouse, bool>>>()))
                .ReturnsAsync((Warehouse)null); // No existing warehouse

             _mockProductRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Product>());

            _mockWarehouseRepo.Setup(r => r.AddAsync(It.IsAny<Warehouse>()))
                .Callback<Warehouse>(w => createdWarehouse = w)
                .Returns(Task.CompletedTask);

            // Act
            await _warehouseService.CreateAsync(createDto);

            // Assert
            createdWarehouse.Should().NotBeNull();
            createdWarehouse.RentType.Should().Be(RentType.Sahis);
            createdWarehouse.StopajRate.Should().Be(20);
            createdWarehouse.VatRate.Should().Be(0);
        }

        [Fact]
        public async Task CreateAsync_ShouldSetVat20_WhenRentTypeIsSirket()
        {
            // Arrange
            var createDto = new CreateWarehouseDto
            {
                Name = "Test Depo Şirket",
                RentType = (int)RentType.Sirket,
                OfficialRentAmount = 50000
            };

            Warehouse createdWarehouse = null;
            _mockWarehouseRepo.Setup(r => r.GetSingleAsync(It.IsAny<Expression<Func<Warehouse, bool>>>()))
                .ReturnsAsync((Warehouse)null);

             _mockProductRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Product>());

            _mockWarehouseRepo.Setup(r => r.AddAsync(It.IsAny<Warehouse>()))
                .Callback<Warehouse>(w => createdWarehouse = w)
                .Returns(Task.CompletedTask);

             // Act
            await _warehouseService.CreateAsync(createDto);

            // Assert
            createdWarehouse.Should().NotBeNull();
            createdWarehouse.RentType.Should().Be(RentType.Sirket);
            createdWarehouse.StopajRate.Should().Be(0);
            createdWarehouse.VatRate.Should().Be(20);
        }
    }
}
