using StockTracking.Application.DTOs.Role;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Interfaces.Services
{
    public interface IRoleService
    {
        Task<ServiceResponse<List<RoleDto>>> GetAllAsync();
        Task<ServiceResponse<bool>> CreateAsync(CreateRoleDto request);
        Task<ServiceResponse<bool>> DeleteAsync(int id);
    }
}
