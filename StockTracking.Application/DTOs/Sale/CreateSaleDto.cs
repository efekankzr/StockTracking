namespace StockTracking.Application.DTOs.Sale
{
    public class CreateSaleDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int PaymentMethodId { get; set; } // 1: Nakit, 2: Kart
                                                 // UserId'yi genellikle Token'dan (Auth) alırız, buraya koymaya gerek yok.
    }
}
