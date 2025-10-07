using Microsoft.OpenApi.Models;
using Microsoft.Extensions.DependencyInjection;

namespace desafio_usuarios_brunohrx.Startup;
    public static class OpenApiConfig
    {
        public static void AddOpenApiServices(this IServiceCollection services)
        {
            // Configuração padrão do Swagger
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }

        public static void UseOpenApi(this WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "desafio_usuarios_brunohrx API v1");
                    options.RoutePrefix = string.Empty; // Swagger na raiz
                });
            }
        }

        public static void AddSwaggerConfiguration(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "ePantanal API",
                    Version = "v1"
                });

                // Configurar autenticação no Swagger
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Insira o token JWT no formato: Bearer {seu token}"
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
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
        }

        public static void UseSwaggerConfiguration(this IApplicationBuilder app)
        {
            app.UseSwagger(c =>
            {
                c.RouteTemplate = "api-docs/{documentName}/swagger.json"; // Define a rota para o JSON
            });

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/api-docs/v1/swagger.json", "desafio_usuarios_brunohrx API v1");
                c.RoutePrefix = "api-docs"; // Define a rota para o Swagger UI
            });
        }
    }
