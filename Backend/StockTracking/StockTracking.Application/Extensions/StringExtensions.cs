using System.Globalization;
using System.Text.RegularExpressions;
using System.Text;

namespace StockTracking.Application.Extensions
{
    public static class StringExtensions
    {
        public static string ToNormalizedString(this string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            var lowerText = text.ToLower(new CultureInfo("tr-TR"));
            var normalized = lowerText.Replace(" ", "_");
        
            return normalized;
        }
    }
}
