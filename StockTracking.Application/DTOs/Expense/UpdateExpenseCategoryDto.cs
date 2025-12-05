using System;
using System.Collections.Generic;
using System.Text;

namespace StockTracking.Application.DTOs.Expense
{
    public class UpdateExpenseCategoryDto : CreateExpenseCategoryDto
    {
        public int Id { get; set; }
    }
}
