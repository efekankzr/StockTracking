namespace StockTracking.Application.DTOs.Warehouse
{
    public class CreateWarehouseDto
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public int RentType { get; set; } // Enum mapping
        public decimal OfficialRentAmount { get; set; }
        public decimal UnofficialRentAmount { get; set; }
    }
}