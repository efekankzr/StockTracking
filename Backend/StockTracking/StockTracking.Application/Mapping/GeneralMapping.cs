using AutoMapper;
using Microsoft.AspNetCore.Identity;
using StockTracking.Application.DTOs.Category;
using StockTracking.Application.DTOs.Product;
using StockTracking.Application.DTOs.Role;
using StockTracking.Application.DTOs.Sale;
using StockTracking.Application.DTOs.Stock;
using StockTracking.Application.DTOs.StockLog;
using StockTracking.Application.DTOs.Transfer;
using StockTracking.Application.DTOs.User;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;
using System.Linq;

namespace StockTracking.Application.Mapping
{
    public class GeneralMapping : Profile
    {
        public GeneralMapping()
        {
            // --- CATEGORY MAPPING ---
            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();

            // --- USER MAPPING ---
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse != null ? src.Warehouse.Name : "Yok"));
                // .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.RoleNames.FirstOrDefault())) // RoleNames not in User entity

            CreateMap<CreateUserDto, User>();
            CreateMap<User, LoginDto>();

            // --- ROLE MAPPING ---
            CreateMap<IdentityRole<int>, RoleDto>();

            // --- WAREHOUSE MAPPING ---
            CreateMap<Warehouse, WarehouseDto>();
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
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.Barcode, opt => opt.MapFrom(src => src.Product.Barcode))
                .ReverseMap();

             // --- SALE MAPPING ---
            CreateMap<Sale, SaleDto>()
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.SalesPerson, opt => opt.MapFrom(src => src.ActualSalesPerson != null ? src.ActualSalesPerson.FullName : src.User.FullName))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod.ToString()));

            CreateMap<SaleItem, SaleItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Barcode, opt => opt.MapFrom(src => src.Product.Barcode))
                .ForMember(dest => dest.LineTotal, opt => opt.MapFrom(src => src.Quantity * src.UnitPrice));

            CreateMap<CreateSaleDto, Sale>();
            CreateMap<CreateSaleItemDto, SaleItem>();

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
        }
    }
}
