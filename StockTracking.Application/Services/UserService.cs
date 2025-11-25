using AutoMapper;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;
using System.Security.Cryptography;
using System.Text;

namespace StockTracking.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<UserDto>>> GetAllAsync()
        {
            // ESKİSİ: var users = await _unitOfWork.Users.GetAllAsync();

            // YENİSİ (Include'lu metot):
            var users = await _unitOfWork.Users.GetAllWithDetailsAsync();

            return new ServiceResponse<List<UserDto>>(_mapper.Map<List<UserDto>>(users));
        }

        public async Task<ServiceResponse<bool>> CreateUserAsync(CreateUserDto request)
        {
            // 1. Kullanıcı var mı?
            var existingUser = await _unitOfWork.Users.GetSingleAsync(u => u.Email == request.Email || u.Username == request.Username);
            if (existingUser != null) return new ServiceResponse<bool>("Kullanıcı zaten mevcut.");

            // 2. Depo Zorunluluğu Kontrolü
            if (request.RoleId != (int)UserRole.Admin)
            {
                if (request.WarehouseId == null || request.WarehouseId == 0)
                    return new ServiceResponse<bool>("Personel için depo seçimi zorunludur.");

                var wh = await _unitOfWork.Warehouses.GetByIdAsync(request.WarehouseId.Value);
                if (wh == null) return new ServiceResponse<bool>("Seçilen depo bulunamadı.");
            }

            var user = _mapper.Map<User>(request);
            user.PasswordHash = CreatePasswordHash(request.Password);
            user.IsActive = true;
            user.Role = (UserRole)request.RoleId;
            if (user.Role == UserRole.Admin) user.WarehouseId = null;

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Personel oluşturuldu.");
        }

        private string CreatePasswordHash(string password)
        {
            using var sha256 = SHA256.Create();
            return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
        }
    }
}