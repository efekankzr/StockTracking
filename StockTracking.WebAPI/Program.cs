using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StockTracking.Application;
using StockTracking.Domain.Entities;
using StockTracking.Persistence;
using StockTracking.Persistence.Context;
using StockTracking.WebAPI;
using System;
using System.Collections.Generic;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// 1. KATMAN SERVÝS KAYITLARI
// ---------------------------------------------------------

// CORS Politikasý
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        b => b
        .WithOrigins("http://localhost:3000") // Frontend adresi
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

// Persistence ve Application Katmanlarý
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddApplicationServices();

// --- MICROSOFT IDENTITY AYARLARI (YENÝ) ---
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    // Þifre Kurallarý (Development için basit tuttum)
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;

    // Kullanýcý Kurallarý
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<StockTrackingDbContext>() // Context ile baðla
.AddDefaultTokenProviders(); // Token iþlemleri için


// ---------------------------------------------------------
// 2. CONTROLLER & FLUENT VALIDATION
// ---------------------------------------------------------
builder.Services.AddControllers();

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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// ---------------------------------------------------------
// 4. SWAGGER (JWT Destekli)
// ---------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

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

app.UseCors("AllowLocalhost");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        SeedData.Initialize(services).Wait();
    }
    catch (Exception ex)
    {
    }
}

app.Run();