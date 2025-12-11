using StockTracking.Application.DTOs.User;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface IUserService
    {
        Task<ServiceResponse<bool>> CreateUserAsync(CreateUserDto request);
        Task<ServiceResponse<bool>> UpdateUserAsync(UpdateUserDto request);
        Task<ServiceResponse<List<UserDto>>> GetAllAsync();
    }
}