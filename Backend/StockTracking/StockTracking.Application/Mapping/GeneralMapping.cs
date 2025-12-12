using AutoMapper;
using Microsoft.AspNetCore.Identity;
using StockTracking.Application.DTOs.Category;
using StockTracking.Application.DTOs.Expense;
using StockTracking.Application.DTOs.Product;
using StockTracking.Application.DTOs.Role;
using StockTracking.Application.DTOs.Sale;
using StockTracking.Application.DTOs.Stock;
using StockTracking.Application.DTOs.StockLog;
using StockTracking.Application.DTOs.Transfer;
using StockTracking.Application.DTOs.User;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;

namespace StockTracking.Application.Mapping
{
    public class GeneralMapping : Profile
    {
        public GeneralMapping()
        {
            // --- USER & AUTH MAPPING ---
            CreateMap<CreateUserDto, User>();

            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.Ignore())
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse != null ? src.Warehouse.Name : null));

            // Role Mapping
            CreateMap<IdentityRole<int>, RoleDto>();

            // --- CATEGORY MAPPING ---
            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();


            // --- WAREHOUSE MAPPING ---
            CreateMap<Warehouse, WarehouseDto>()
                .ForMember(dest => dest.RentTypeName, opt => opt.MapFrom(src => src.RentType.ToString()))
                .ForMember(dest => dest.RentTypeValue, opt => opt.MapFrom(src => (int)src.RentType));
            // Removed ReverseMap() to avoid RentTypeName/Val conflict mapping back to RentType
            CreateMap<CreateWarehouseDto, Warehouse>();
            CreateMap<UpdateWarehouseDto, Warehouse>();


            // --- PRODUCT MAPPING ---
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ReverseMap();

            CreateMap<Product, ProductListDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.TotalStockQuantity, opt => opt.MapFrom(src => src.Stocks.Sum(s => s.Quantity)));

            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();


            // --- STOCK MAPPING ---
            CreateMap<Stock, StockDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Barcode, opt => opt.MapFrom(src => src.Product.Barcode))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name));


            // --- SALE MAPPING ---
            CreateMap<Sale, SaleDto>()
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.SalesPerson, opt => opt.MapFrom(src =>
                    src.ActualSalesPerson != null ? src.ActualSalesPerson.FullName : src.User.FullName))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod.ToString()))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.TotalAmount));

            // --- SALE ITEM MAPPING ---
            CreateMap<SaleItem, SaleItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Barcode, opt => opt.MapFrom(src => src.Product.Barcode))
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice))
                .ForMember(dest => dest.LineTotal, opt => opt.MapFrom(src => src.Quantity * src.UnitPrice));

            CreateMap<CreateSaleDto, Sale>();


            // --- TRANSFER MAPPING ---
            CreateMap<StockTransfer, TransferDto>()
                .ForMember(dest => dest.SourceWarehouseName, opt => opt.MapFrom(src => src.SourceWarehouse.Name))
                .ForMember(dest => dest.TargetWarehouseName, opt => opt.MapFrom(src => src.TargetWarehouse.Name))
                .ForMember(dest => dest.SourceWarehouseId, opt => opt.MapFrom(src => src.SourceWarehouseId))
                .ForMember(dest => dest.TargetWarehouseId, opt => opt.MapFrom(src => src.TargetWarehouseId))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<CreateTransferDto, StockTransfer>();


            // --- STOCK LOG MAPPING ---
            CreateMap<StockLog, StockLogDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.ProcessType, opt => opt.MapFrom(src => src.ProcessType.ToString()));

            // --- EXPENSE MAPPING (GÝDER MODÜLÜ) ---
            CreateMap<ExpenseCategory, ExpenseCategoryDto>().ReverseMap();
            CreateMap<CreateExpenseCategoryDto, ExpenseCategory>();
            CreateMap<UpdateExpenseCategoryDto, ExpenseCategory>();

            CreateMap<ExpenseTransaction, ExpenseTransactionDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.ExpenseCategory.Name))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName));

            CreateMap<CreateExpenseTransactionDto, ExpenseTransaction>();
        }
    }
}
