using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace desafio_usuarios_brunohrx.Startup;
    public static class OpenApiConfig
    {
        public static void AddOpenApiServices(this IServiceCollection services)
        {
            // Configuração padrão do Swagger
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                // Segurança Bearer (JWT)
                c.AddSecurityDefinition("BearerAuth", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Insira o token no formato: Bearer {seu_token}"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                { Type = ReferenceType.SecurityScheme, Id = "BearerAuth" }
                            },
                            Array.Empty<string>()
                        }
                    });
            });

            // Gera um SwaggerDoc por versão de API automaticamente
            services.ConfigureOptions<ConfigureSwaggerOptions>();
    }

 

        public static void UseSwaggerConfiguration(this IApplicationBuilder app)
        {
            var provider = app.ApplicationServices.GetRequiredService<IApiVersionDescriptionProvider>();

            app.UseSwagger(c =>
            {
                // JSONs em /api-docs/{documentName}/swagger.json
                c.RouteTemplate = "api-docs/{documentName}/swagger.json";
            });

            app.UseSwaggerUI(c =>
            {
                foreach (var desc in provider.ApiVersionDescriptions)
                {
                    c.SwaggerEndpoint($"/api-docs/{desc.GroupName}/swagger.json",
                                      $"Desafio Usuarios API {desc.GroupName.ToUpperInvariant()}");
                }
                c.RoutePrefix = "api-docs"; // UI em /api-docs
            });
        }

        public sealed class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
        {
            private readonly IApiVersionDescriptionProvider _provider;

            public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider)
            {
                _provider = provider;
            }

            public void Configure(SwaggerGenOptions options)
            {
                foreach (var desc in _provider.ApiVersionDescriptions)
                {
                    options.SwaggerDoc(desc.GroupName, new OpenApiInfo
                    {
                        Title = "Desafio Usuarios API",
                        Version = desc.ApiVersion.ToString()
                    });
                }
            }
        }
}
