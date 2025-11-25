namespace StockTracking.Application.DTOs.Auth
{
    public class CreateUserDto
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; } // Yeni
        public string Password { get; set; }
        public int RoleId { get; set; } // 0: Admin, 1: Depo, 2: Satış
        public int? WarehouseId { get; set; } // Yeni (Admin için boş olabilir)
    }
}
