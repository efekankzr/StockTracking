using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StockTracking.Application.DTOs.Auth;
using StockTracking.Application.Interfaces.Repositories;
using StockTracking.Application.Interfaces.Services;
using StockTracking.Application.Wrappers;
using StockTracking.Domain.Entities;
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

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
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

        // Helper Metotlar
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

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            using var sha256 = SHA256.Create();
            var inputHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
            return inputHash == storedHash;
        }
    }
}