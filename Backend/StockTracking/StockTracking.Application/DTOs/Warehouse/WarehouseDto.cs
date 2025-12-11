namespace StockTracking.Application.DTOs.Warehouse
{
    public class WarehouseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string RentTypeName { get; set; } 
        public int RentTypeValue { get; set; } 
        public decimal OfficialRentAmount { get; set; }
        public decimal UnofficialRentAmount { get; set; }
        public int StopajRate { get; set; }
        public int VatRate { get; set; }
        public bool IsActive { get; set; }
    }
}