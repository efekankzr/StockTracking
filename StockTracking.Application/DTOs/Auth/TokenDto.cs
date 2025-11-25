namespace StockTracking.Application.DTOs.Auth
{
    public class TokenDto
    {
        public string AccessToken { get; set; }
        public DateTime Expiration { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
    }
}