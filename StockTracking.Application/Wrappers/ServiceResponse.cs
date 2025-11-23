namespace StockTracking.Application.Wrappers
{
    public class ServiceResponse<T>
    {
        public T Data { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }

        // Başarılı - Data Var
        public ServiceResponse(T data)
        {
            Data = data;
            Success = true;
            Message = "İşlem başarılı.";
        }

        // Başarılı - Mesajlı
        public ServiceResponse(T data, string message)
        {
            Data = data;
            Success = true;
            Message = message;
        }

        // Başarısız
        public ServiceResponse(string message)
        {
            Success = false;
            Message = message;
        }
    }
}