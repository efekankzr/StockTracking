using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<ServiceResponse<TokenDto>> LoginAsync(LoginDto request);
    }
}
