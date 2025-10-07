using desafio_usuarios_brunohrx.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace desafio_usuarios_brunohrx.Startup
{
    public static class DependenciesConfig
    {
        public static void AddDependencies(this WebApplicationBuilder builder)
        {
            // Add OpenAPI services
            builder.Services.AddOpenApiServices();

            // Adiciona DbContext com conexão SQL Server
             builder.Services.AddDbContext<AppDbContext>(options =>
            {
                var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException("Database connection string 'DefaultConnection' is not configured.");
                }

                 options.UseSqlServer(connectionString);
            });
        }
    }
}