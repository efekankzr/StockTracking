using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
using StockTracking.Domain.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace StockTracking.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<TokenDto>> LoginAsync(LoginDto request)
        {
            var user = await _unitOfWork.Users.GetSingleAsync(u => u.Username == request.Username);
            if (user == null) return new ServiceResponse<TokenDto>("Kullanıcı adı veya şifre hatalı.");

            if (!VerifyPasswordHash(request.Password, user.PasswordHash))
                return new ServiceResponse<TokenDto>("Kullanıcı adı veya şifre hatalı.");

            if (!user.IsActive) return new ServiceResponse<TokenDto>("Hesap pasif.");

            var tokenDto = GenerateTokenDto(user);
            return new ServiceResponse<TokenDto>(tokenDto);
        }

        public async Task<ServiceResponse<bool>> CreateUserAsync(CreateUserDto request)
        {
            // 1. Username/Email Kontrolü
            var existingUser = await _unitOfWork.Users.GetSingleAsync(u => u.Email == request.Email || u.Username == request.Username);
            if (existingUser != null)
                return new ServiceResponse<bool>("Kullanıcı adı veya e-posta zaten kullanımda.");

            // 2. Depo Kontrolü (Eğer Admin değilse depo geçerli mi?)
            if (request.RoleId != (int)UserRole.Admin)
            {
                if (request.WarehouseId == null)
                    return new ServiceResponse<bool>("Personel için depo seçimi zorunludur.");

                var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(request.WarehouseId.Value);
                if (warehouse == null)
                    return new ServiceResponse<bool>("Seçilen depo bulunamadı.");
            }

            // 3. Mapping ve Hash
            var user = _mapper.Map<User>(request);
            user.PasswordHash = CreatePasswordHash(request.Password);
            user.IsActive = true;
            user.Role = (UserRole)request.RoleId;

            // Admin ise WarehouseId null olabilir, değilse gelen değer atanır.
            if (user.Role == UserRole.Admin) user.WarehouseId = null;

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Personel başarıyla oluşturuldu.");
        }

        // Helpers
        private string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var now = DateTime.Now;

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                notBefore: now,
                expires: now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private TokenDto GenerateTokenDto(User user)
        {
            return new TokenDto
            {
                AccessToken = GenerateToken(user),
                Expiration = DateTime.Now.AddDays(1),
                Username = user.Username,
                UserId = user.Id,
                Role = user.Role.ToString()
            };
        }

        private string CreatePasswordHash(string password)
        {
            using var sha256 = SHA256.Create();
            return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            using var sha256 = SHA256.Create();
            return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password))) == storedHash;
        }
    }
}