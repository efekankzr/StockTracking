using AutoMapper;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.DTOs.Category;
using StockTracking.Application.DTOs.Product;
using StockTracking.Application.DTOs.Sale;
using StockTracking.Application.DTOs.Warehouse;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Mapping
{
    public class GeneralMapping : Profile
    {
        public GeneralMapping()
        {
            // --- PRODUCT MAPPING ---

            // Listeleme yaparken (Entity -> Dto)
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name)) // İlişkili tablodan veri çekme
                .ReverseMap(); // Tersi de geçerli olsun (Dto -> Entity)

            CreateMap<Product, ProductListDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));

            // Kayıt yaparken (CreateDto -> Entity)
            CreateMap<CreateProductDto, Product>();

            // Güncelleme yaparken (UpdateDto -> Entity)
            CreateMap<UpdateProductDto, Product>();


            // --- CATEGORY MAPPING ---
            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();


            // --- WAREHOUSE MAPPING ---
            CreateMap<Warehouse, WarehouseDto>().ReverseMap();
            CreateMap<CreateWarehouseDto, Warehouse>();
            CreateMap<UpdateWarehouseDto, Warehouse>();


            // --- USER MAPPING ---
            CreateMap<User, UserDto>().ReverseMap();
            CreateMap<RegisterDto, User>();


            // --- SALE MAPPING ---
            // Satış raporu için özel eşleştirme
            CreateMap<Sale, SaleReportDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.SalesPersonName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.Quantity * src.SnapshotSalePrice)); // Hesaplama

            CreateMap<CreateSaleDto, Sale>();
        }
    }
}