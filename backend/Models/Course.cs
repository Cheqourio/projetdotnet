using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Course
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [MaxLength(20)]
    public string? Code { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = default!;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(120)]
    public string? Department { get; set; }

    [MaxLength(50)]
    public string? Level { get; set; }

    [MaxLength(30)]
    public string? Hours { get; set; }

    [MaxLength(120)]
    public string? Schedule { get; set; }

    [MaxLength(30)]
    public string? Status { get; set; }

    public int? TeacherId { get; set; }

    public Teacher? Teacher { get; set; }

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

