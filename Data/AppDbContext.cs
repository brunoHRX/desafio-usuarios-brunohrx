using Microsoft.EntityFrameworkCore;

namespace desafio_usuarios_brunohrx.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Usuario> Usuarios { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Usuario
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.usuario)
            .IsUnique();
        }
    }
}
