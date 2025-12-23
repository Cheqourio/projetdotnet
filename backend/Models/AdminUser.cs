using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class AdminUser
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Email { get; set; } = default!;

    [Required]
    public string PasswordHash { get; set; } = default!;

    [MaxLength(50)]
    public string Role { get; set; } = "admin";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

