using AutoMapper;
using Microsoft.AspNetCore.Identity;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.DTOs.Category;
using StockTracking.Application.DTOs.Product;
using StockTracking.Application.DTOs.Role;
using StockTracking.Application.DTOs.Sale;
using StockTracking.Application.DTOs.Stock;
using StockTracking.Application.DTOs.StockLog;
using StockTracking.Application.DTOs.User;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Mapping
{
    public class GeneralMapping : Profile
    {
        public GeneralMapping()
        {
            CreateMap<CreateUserDto, User>();

            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.Ignore())
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse != null ? src.Warehouse.Name : null));

            CreateMap<IdentityRole<int>, RoleDto>();

            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();


            CreateMap<Warehouse, WarehouseDto>().ReverseMap();
            CreateMap<CreateWarehouseDto, Warehouse>();
            CreateMap<UpdateWarehouseDto, Warehouse>();


            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ReverseMap();

            CreateMap<Product, ProductListDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.TotalStockQuantity, opt => opt.MapFrom(src => src.Stocks.Sum(s => s.Quantity)));

            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();


            CreateMap<Stock, StockDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Barcode, opt => opt.MapFrom(src => src.Product.Barcode))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name));



            CreateMap<Sale, SaleDto>()
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.SalesPerson, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod.ToString()));

            CreateMap<SaleItem, SaleItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Barcode, opt => opt.MapFrom(src => src.Product.Barcode))
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPriceWithVat));

            CreateMap<CreateSaleDto, Sale>();


            CreateMap<StockLog, StockLogDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.ProcessType, opt => opt.MapFrom(src => src.ProcessType.ToString()));
        }
    }
}