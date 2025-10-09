using Microsoft.EntityFrameworkCore;


namespace desafio_usuarios_brunohrx.Data;


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }


    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<AuthRefreshToken> AuthRefreshTokens => Set<AuthRefreshToken>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // Usuario
        var u = modelBuilder.Entity<Usuario>();
        u.HasIndex(x => x.usuario).IsUnique();
        u.HasIndex(x => x.email).IsUnique();
        u.Property(x => x.RowVersion).IsRowVersion();


        // Filtro global: só usuários ativos
        u.HasQueryFilter(x => x.ativo);


        // RefreshToken
        var rt = modelBuilder.Entity<AuthRefreshToken>();
        rt.HasIndex(x => new { x.UserId, x.ExpiresAt });

    }
}