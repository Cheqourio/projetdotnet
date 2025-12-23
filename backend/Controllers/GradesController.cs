using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace backend.Controllers;

public record CreateEnrollmentDto
{
    [Required]
    public int StudentId { get; set; }
    
    [Required]
    public int CourseId { get; set; }
    
    public decimal? Score { get; set; }
    
    public string? Status { get; set; }
    
    public string? SessionType { get; set; }
    
    public string? Comment { get; set; }
    
    public string? Code { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class GradesController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Enrollment>>> GetAll()
    {
        var grades = await context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .OrderByDescending(e => e.UpdatedAt)
            .ToListAsync();
        return Ok(grades);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Enrollment>> Get(int id)
    {
        var grade = await context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.Id == id);
        return grade is null ? NotFound() : Ok(grade);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Enrollment>> Create([FromBody] CreateEnrollmentDto dto)
    {
        // Vérifier manuellement que les champs requis sont présents
        if (dto.StudentId <= 0 || dto.CourseId <= 0)
        {
            return BadRequest(new { 
                message = "StudentId et CourseId sont requis et doivent être supérieurs à 0",
                errors = new Dictionary<string, string[]>
                {
                    { "StudentId", new[] { "StudentId est requis" } },
                    { "CourseId", new[] { "CourseId est requis" } }
                }
            });
        }

        if (!ModelState.IsValid)
    {
            return BadRequest(ModelState);
        }

        // Créer un nouvel Enrollment avec seulement les IDs (pas les objets de navigation)
        var enrollment = new Enrollment
        {
            StudentId = dto.StudentId,
            CourseId = dto.CourseId,
            Score = dto.Score,
            Status = dto.Status,
            SessionType = dto.SessionType,
            Comment = dto.Comment,
            Code = dto.Code,
            UpdatedAt = DateTime.UtcNow
        };

        context.Enrollments.Add(enrollment);
        await context.SaveChangesAsync();
        
        // Charger l'enrollment avec les objets de navigation pour la réponse
        var created = await context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.Id == enrollment.Id);
            
        return CreatedAtAction(nameof(Get), new { id = enrollment.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] Enrollment updated)
    {
        var grade = await context.Enrollments.FindAsync(id);
        if (grade is null) return NotFound();

        grade.Code = updated.Code;
        grade.StudentId = updated.StudentId;
        grade.CourseId = updated.CourseId;
        grade.Score = updated.Score;
        grade.Status = updated.Status;
        grade.SessionType = updated.SessionType;
        grade.Comment = updated.Comment;
        grade.UpdatedAt = updated.UpdatedAt ?? DateTime.UtcNow;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var grade = await context.Enrollments.FindAsync(id);
        if (grade is null) return NotFound();

        context.Enrollments.Remove(grade);
        await context.SaveChangesAsync();
        return NoContent();
    }
}

