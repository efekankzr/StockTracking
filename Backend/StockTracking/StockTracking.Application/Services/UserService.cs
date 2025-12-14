using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StockTracking.Application.DTOs.User;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;

namespace StockTracking.Application.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly IMapper _mapper;

        public UserService(UserManager<User> userManager, RoleManager<IdentityRole<int>> roleManager, IMapper mapper)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<UserDto>>> GetAllAsync()
        {
            var users = await _userManager.Users
                .Include(u => u.Warehouse)
                .AsNoTracking()
                .ToListAsync();

            var dtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var dto = _mapper.Map<UserDto>(user);
                dto.Role = roles.FirstOrDefault() ?? "User";
                dtos.Add(dto);
            }

            return new ServiceResponse<List<UserDto>>(dtos);
        }

        public async Task<ServiceResponse<bool>> CreateUserAsync(CreateUserDto request)
        {
            var existing = await _userManager.FindByNameAsync(request.Username);
            if (existing != null) return ServiceResponse<bool>.Fail("Kullanıcı zaten var.");

            var user = new User
            {
                UserName = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                WarehouseId = request.WarehouseId,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return new ServiceResponse<bool>(string.Join(", ", result.Errors.Select(e => e.Description)));

            if (!await _roleManager.RoleExistsAsync(request.Role))
                await _roleManager.CreateAsync(new IdentityRole<int>(request.Role));

            await _userManager.AddToRoleAsync(user, request.Role);

            return new ServiceResponse<bool>(true, "Personel oluşturuldu.");
        }

        public async Task<ServiceResponse<bool>> UpdateUserAsync(UpdateUserDto request)
        {
            var user = await _userManager.FindByIdAsync(request.Id);
            if (user == null) return ServiceResponse<bool>.Fail("Kullanıcı bulunamadı.");

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.WarehouseId = request.WarehouseId;

            // Eğer e-posta değiştiyse username'i de güncellemek gerekebilir ancak şimdilik sabit bırakıyoruz veya ayrı ele alıyoruz.
            // Bu örnekte UserName değiştirilmiyor.

            // Eğer telefon değiştiyse (Opsional)
            user.PhoneNumber = request.PhoneNumber;
            
            // UserName değişimi şu an desteklenmiyor ama ilerde eklenebilir. 

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return new ServiceResponse<bool>(string.Join(", ", result.Errors.Select(e => e.Description)));

            // Rol Güncelleme
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (!currentRoles.Contains(request.Role))
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                
                if (!await _roleManager.RoleExistsAsync(request.Role))
                    await _roleManager.CreateAsync(new IdentityRole<int>(request.Role));

                await _userManager.AddToRoleAsync(user, request.Role);
            }

            return new ServiceResponse<bool>(true, "Personel güncellendi.");
        }
    }
}
