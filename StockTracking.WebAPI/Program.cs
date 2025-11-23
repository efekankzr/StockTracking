using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StockTracking.Application;
using StockTracking.Persistence;
using System.Collections.Generic;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// 1. KATMAN SERVÝS KAYITLARI
// ---------------------------------------------------------
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddApplicationServices();

// ---------------------------------------------------------
// 2. CONTROLLER & FLUENT VALIDATION
// ---------------------------------------------------------
builder.Services.AddControllers();

// Modern FluentValidation kullanýmý
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

// ---------------------------------------------------------
// 3. JWT AUTHENTICATION
// ---------------------------------------------------------
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        // Null check (!) ekledik, boþ gelirse hata versin diye
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// ---------------------------------------------------------
// 4. SWAGGER (JWT Kilit Butonu Destekli)
// ---------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Yetkilendirme Tanýmý
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Yetkilendirme Gereksinimi
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// ---------------------------------------------------------
// 5. MIDDLEWARE PIPELINE
// ---------------------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Sýralama Önemli: Önce Kimlik, Sonra Yetki
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();