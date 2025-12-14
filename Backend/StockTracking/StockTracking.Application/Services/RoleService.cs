using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StockTracking.Application.DTOs.Role;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;

namespace StockTracking.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly IMapper _mapper;

        public RoleService(RoleManager<IdentityRole<int>> roleManager, IMapper mapper)
        {
            _roleManager = roleManager;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<RoleDto>>> GetAllAsync()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            var dtos = _mapper.Map<List<RoleDto>>(roles);
            return new ServiceResponse<List<RoleDto>>(dtos);
        }

        public async Task<ServiceResponse<bool>> CreateAsync(CreateRoleDto request)
        {
            if (await _roleManager.RoleExistsAsync(request.Name))
                return ServiceResponse<bool>.Fail("Bu isimde bir rol zaten mevcut.");

            var role = new IdentityRole<int>
            {
                Name = request.Name,
                NormalizedName = request.Name.ToUpper()
            };

            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return new ServiceResponse<bool>(errors);
            }

            return new ServiceResponse<bool>(true, "Rol başarıyla oluşturuldu.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null)
                return ServiceResponse<bool>.Fail("Rol bulunamadı.");

            if (role.Name == "Admin")
                return ServiceResponse<bool>.Fail("Admin rolü silinemez.");

            var result = await _roleManager.DeleteAsync(role);

            if (!result.Succeeded)
                return ServiceResponse<bool>.Fail("Silme işlemi başarısız.");

            return new ServiceResponse<bool>(true, "Rol silindi.");
        }
    }
}
