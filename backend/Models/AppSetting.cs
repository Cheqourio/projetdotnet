using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class AppSetting
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Key { get; set; } = default!;

    [MaxLength(1000)]
    public string? Value { get; set; }
}

