using AutoMapper;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.DTOs.Category;
using StockTracking.Application.DTOs.Product;
using StockTracking.Application.DTOs.Sale;
using StockTracking.Application.DTOs.Stock;
using StockTracking.Application.DTOs.StockLog;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Mapping
{
    public class GeneralMapping : Profile
    {
        public GeneralMapping()
        {
            // --- USER & AUTH MAPPING ---
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

            CreateMap<CreateUserDto, User>();
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name));


            // --- CATEGORY MAPPING ---
            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();


            // --- WAREHOUSE MAPPING ---
            CreateMap<Warehouse, WarehouseDto>().ReverseMap();
            CreateMap<CreateWarehouseDto, Warehouse>();
            CreateMap<UpdateWarehouseDto, Warehouse>();


            // --- PRODUCT MAPPING ---
            // 1. Detay Görüntüleme
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ReverseMap();

            // 2. Liste Görüntüleme (Hesaplamalı Alanlar)
            CreateMap<Product, ProductListDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                // Ürünün tüm depolardaki toplam stoğunu hesapla:
                .ForMember(dest => dest.TotalStockQuantity, opt => opt.MapFrom(src => src.Stocks.Sum(s => s.Quantity)));

            // 3. Ekleme ve Güncelleme
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();


            // --- STOCK MAPPING ---
            CreateMap<Stock, StockDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Barcode, opt => opt.MapFrom(src => src.Product.Barcode))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name));

            // CreateStockEntryDto için bir map'e gerek yok, manuel işliyoruz (Service içinde).


            // --- SALE MAPPING (Kritik Bölüm) ---
            CreateMap<Sale, SaleDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name)) // Yeni Eklendi
                .ForMember(dest => dest.SalesPerson, opt => opt.MapFrom(src => src.User.Username)) // veya FullName
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod.ToString())) // Enum -> String
                                                                                                                // Snapshot fiyatlarını gösteriyoruz (Güncel fiyatı değil!)
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.SnapshotSalePrice))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.Quantity * src.SnapshotSalePrice));

            CreateMap<CreateSaleDto, Sale>();


            // --- STOCK LOG MAPPING (Raporlama İçin) ---
            CreateMap<StockLog, StockLogDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.WarehouseName, opt => opt.MapFrom(src => src.Warehouse.Name))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Username))
                .ForMember(dest => dest.ProcessType, opt => opt.MapFrom(src => src.ProcessType.ToString()));
        }
    }
}