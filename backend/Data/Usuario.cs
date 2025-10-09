using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace desafio_usuarios_brunohrx.Data;


public class Usuario
{
    [Key]
    public int id { get; set; }


    [Required, StringLength(60)]
    public string usuario { get; set; } = string.Empty;


    [Required, StringLength(160)]
    public string email { get; set; } = string.Empty;


    [Required]
    public string senha { get; set; } = string.Empty; // BCrypt hash


    public bool ativo { get; set; } = true; // soft delete


    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>(); // concorrência otimista
}