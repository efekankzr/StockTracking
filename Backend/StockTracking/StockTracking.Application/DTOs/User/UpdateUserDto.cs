
using System.ComponentModel.DataAnnotations;

namespace StockTracking.Application.DTOs.User
{
    public class UpdateUserDto
    {
        [Required]
        public string Id { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public int? WarehouseId { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
