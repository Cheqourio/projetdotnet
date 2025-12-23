using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Teacher
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

    [MaxLength(30)]
    public string? Status { get; set; }

    [MaxLength(150)]
    public string? Subject { get; set; }

    [MaxLength(50)]
    public string? Seniority { get; set; }

    [MaxLength(30)]
    public string? Hours { get; set; }

    [MaxLength(30)]
    public string? Phone { get; set; }

    [MaxLength(120)]
    public string? Department { get; set; }

    public ICollection<Course> Courses { get; set; } = new List<Course>();
}

