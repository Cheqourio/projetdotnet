using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace backend.Models;

public class Enrollment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [MaxLength(20)]
    public string? Code { get; set; }

    [Required]
    public int StudentId { get; set; }

    [ValidateNever]
    public Student? Student { get; set; }

    [Required]
    public int CourseId { get; set; }

    [ValidateNever]
    public Course? Course { get; set; }

    public decimal? Score { get; set; }

    [MaxLength(30)]
    public string? Status { get; set; }

    [MaxLength(80)]
    public string? SessionType { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [MaxLength(500)]
    public string? Comment { get; set; }
}

