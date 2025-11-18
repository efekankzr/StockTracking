using AutoMapper;
using StockTracking.Application.DTOs.Product;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Mapping
{
    public class ProductProfile : Profile
    {
        public ProductProfile()
        {
            CreateMap<Product, ProductDto>();
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();
        }
    }
}
