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
            // 1. Kullanıcıyı bul
            var user = await _unitOfWork.Users.GetSingleAsync(u => u.Username == request.Username);

            if (user == null)
                return new ServiceResponse<TokenDto>("Kullanıcı adı veya şifre hatalı.");

            // 2. Şifre kontrolü
            if (!VerifyPasswordHash(request.Password, user.PasswordHash))
                return new ServiceResponse<TokenDto>("Kullanıcı adı veya şifre hatalı.");

            if (!user.IsActive)
                return new ServiceResponse<TokenDto>("Kullanıcı hesabı pasif durumdadır.");

            // 3. Token Üretimi (DÜZELTİLEN KISIM BURASI)
            // Önce string token'ı alıyoruz
            var tokenString = GenerateToken(user);

            // Sonra onu DTO nesnesine paketliyoruz
            var tokenDto = new TokenDto
            {
                AccessToken = tokenString,
                Expiration = DateTime.Now.AddDays(1), // Token ömrü
                Username = user.Username,
                UserId = user.Id,
                Role = user.Role.ToString()
            };

            // Artık string değil, NESNE döndürüyoruz. 
            // Böylece ServiceResponse bunu "Data" olarak algılayıp Success = true yapacak.
            return new ServiceResponse<TokenDto>(tokenDto);
        }

        public async Task<ServiceResponse<bool>> RegisterAsync(RegisterDto request)
        {
            // 1. Email veya Username var mı?
            var existingUser = await _unitOfWork.Users.GetSingleAsync(u => u.Email == request.Email || u.Username == request.Username);
            if (existingUser != null)
                return new ServiceResponse<bool>("Bu kullanıcı adı veya e-posta zaten kayıtlı.");

            // 2. DTO -> Entity çevrimi
            var user = _mapper.Map<User>(request);

            // 3. Şifreyi Hashle
            user.PasswordHash = CreatePasswordHash(request.Password);
            user.Role = (UserRole)request.RoleId;
            user.IsActive = true;

            // 4. Kaydet
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResponse<bool>(true, "Kullanıcı başarıyla oluşturuldu.");
        }

        // --- YARDIMCI METOTLAR (HELPER METHODS) ---

        private string GenerateToken(User user)
        {
            // Token içindeki bilgiler (Claims)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
                // İstersen Email vb. ekleyebilirsin
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var expiration = DateTime.Now.AddDays(1); // Token 1 gün geçerli olsun

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Basit bir Hashing yöntemi (Daha profesyoneli için BCrypt kullanılabilir)
        private string CreatePasswordHash(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                var inputHash = Convert.ToBase64String(bytes);
                return inputHash == storedHash;
            }
        }

        // TokenDto oluşturucu (Helper olarak kullanmak istersen)
        private TokenDto GenerateTokenDto(User user)
        {
            var tokenString = GenerateToken(user);
            return new TokenDto
            {
                AccessToken = tokenString,
                Expiration = DateTime.Now.AddDays(1),
                Username = user.Username,
                UserId = user.Id,
                Role = user.Role.ToString()
            };
        }
    }
}