namespace StockTracking.Application.Wrappers
{
    public class ServiceResponse<T>
    {
        public T? Data { get; set; }
        public bool Success { get; set; }
        public string? Message { get; set; }

        public List<string>? Errors { get; set; }

        public ServiceResponse()
        {
        }

        // Başarılı - Data Var
        public ServiceResponse(T data)
        {
            Data = data;
            Success = true;
            Message = "İşlem başarılı.";
            Errors = null;
        }

        // Başarılı - Mesajlı
        public ServiceResponse(T data, string message)
        {
            Data = data;
            Success = true;
            Message = message;
            Errors = null;
        }

        public static ServiceResponse<T> SuccessResult(T data, string message = "İşlem başarılı.")
        {
            return new ServiceResponse<T>(data, message);
        }

        // Başarısız - Tek Mesaj
        public ServiceResponse(string message)
        {
            Success = false;
            Message = message;
            Errors = new List<string> { message };
        }

        // Başarısız - Çoklu Hata
        public static ServiceResponse<T> Fail(List<string> errors)
        {
            return new ServiceResponse<T>
            {
                Success = false,
                Message = "Validation hatası",
                Errors = errors
            };
        }

        public static ServiceResponse<T> Fail(string message)
        {
            return new ServiceResponse<T>
            {
                Success = false,
                Message = message,
                Errors = new List<string> { message }
            };
        }
    }
}
