namespace desafio_usuarios_brunohrx.Data
{
    public class Usuario
    {
        public int id { get; set; }
        public required string usuario { get; set; }
        public required string email { get; set; }
        public required string senha { get; set; }
        public required bool ativo { get; set; }
    }

}
