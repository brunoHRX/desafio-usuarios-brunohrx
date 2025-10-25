using desafio_usuarios_brunohrx.Controllers;
using desafio_usuarios_brunohrx.Startup;
using DesafioUsuarios.Api.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .Validate(o => !string.IsNullOrWhiteSpace(o.Key), "Jwt:Key ausente")
    .Validate(o => !string.IsNullOrWhiteSpace(o.Issuer), "Jwt:Issuer ausente")
    .Validate(o => !string.IsNullOrWhiteSpace(o.Audience), "Jwt:Audience ausente")
    .ValidateOnStart();

builder.Services
    .AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection(SmtpOptions.SectionName))
    .Validate(o => !string.IsNullOrWhiteSpace(o.Host), "Smtp:Host ausente")
    .Validate(o => o.Port > 0, "Smtp:Port inválido")
    .Validate(o => !string.IsNullOrWhiteSpace(o.User), "Smtp:User ausente")
    .Validate(o => !string.IsNullOrWhiteSpace(o.Pass), "Smtp:Pass ausente")
    .Validate(o => !string.IsNullOrWhiteSpace(o.From), "Smtp:From ausente")
    .ValidateOnStart();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection ausente");


builder.AddDependencies();


// Configuração de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:9000")              
              .AllowAnyMethod()              
              .AllowAnyHeader();
    });
});


builder.Services.AddControllers(options =>
{
    options.Filters.Add(new AuthorizeFilter());
});



//Autenticação JWT
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        var issuer = builder.Configuration["Jwt:Issuer"];
//        var audience = builder.Configuration["Jwt:Audience"];
//        var key = builder.Configuration["Jwt:Key"];
//        if (string.IsNullOrWhiteSpace(key))
//            throw new InvalidOperationException("Jwt:Key não configurada");

//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateLifetime = true,
//            ValidateIssuerSigningKey = true,
//            ValidIssuer = issuer,
//            ValidAudience = audience,
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
//        };
//    });

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        
        var jwt = builder.Configuration
            .GetSection(JwtOptions.SectionName)
            .Get<JwtOptions>()
            ?? throw new InvalidOperationException("Seção 'Jwt' ausente.");

        if (string.IsNullOrWhiteSpace(jwt.Key))
            throw new InvalidOperationException("Jwt:Key não configurada.");

        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ClockSkew = TimeSpan.Zero // evita “token ainda não válido/expirado” por tolerância de relógio
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

// Configuração de versionamento de API
builder.Services.AddApiVersioning(options =>
{
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
    options.ReportApiVersions = true;

});

builder.Services.AddVersionedApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";           // v1, v1.1, v2
    options.SubstituteApiVersionInUrl = true;     // substitui {version} na rota
});

builder.Services.AddHealthChecks();

builder.Services.AddRateLimiting();

var app = builder.Build();


if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.Use(async (ctx, next) =>
{
    if (HttpMethods.IsOptions(ctx.Request.Method))
    {
        ctx.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }
    await next();
});

app.UseAuthentication();

app.UseAuthorization();

app.UseSwaggerConfiguration();



app.AddRootControllers();

app.MapControllers();

app.Run();