using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using StockTracking.Application.Wrappers;
using System.Net;
using System.Text.Json;

namespace StockTracking.WebAPI.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Bir hata oluştu: {ex.Message}");
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new ServiceResponse<string>() 
            {
                Success = false,
                Message = "Sunucu hatası oluştu."
            };
            response.Success = false;
            
            // Geliştirme ortamında detay gösterilebilir, prod'da gizlenmeli.
            // Şimdilik basit tutuyoruz.
            response.Message = exception.Message; 

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }
    }
}
