namespace StockTracking.Application.DTOs.Auth
{
    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; } // Enum yerine string dönebiliriz okunabilir olsun diye
    }
}
