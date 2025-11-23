namespace StockTracking.Application.DTOs.Auth
{
    public class RegisterDto
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; } // 0: Admin, 1: Depo, 2: Satış
    }
}