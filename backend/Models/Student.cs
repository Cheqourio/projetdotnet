using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Student
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [MaxLength(20)]
    public string? Code { get; set; }

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = default!;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = default!;

    [Required, MaxLength(200)]
    public string Email { get; set; } = default!;

    [MaxLength(150)]
    public string? Program { get; set; }

    [MaxLength(50)]
    public string? Level { get; set; }

    [MaxLength(30)]
    public string? Status { get; set; }

    public decimal? Average { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

