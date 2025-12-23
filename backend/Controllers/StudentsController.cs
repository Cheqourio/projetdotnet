using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Student>>> GetAll()
    {
        var students = await context.Students
            .OrderBy(s => s.LastName)
            .ToListAsync();
        return Ok(students);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Student>> Get(int id)
    {
        var student = await context.Students.FindAsync(id);
        return student is null ? NotFound() : Ok(student);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Student>> Create([FromBody] Student student)
    {
        context.Students.Add(student);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = student.Id }, student);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] Student updated)
    {
        var student = await context.Students.FindAsync(id);
        if (student is null) return NotFound();

        student.Code = updated.Code;
        student.FirstName = updated.FirstName;
        student.LastName = updated.LastName;
        student.Email = updated.Email;
        student.Program = updated.Program;
        student.Level = updated.Level;
        student.Status = updated.Status;
        student.Average = updated.Average;
        student.UpdatedAt = updated.UpdatedAt ?? DateTime.UtcNow;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await context.Students.FindAsync(id);
        if (student is null) return NotFound();

        context.Students.Remove(student);
        await context.SaveChangesAsync();
        return NoContent();
    }
}

