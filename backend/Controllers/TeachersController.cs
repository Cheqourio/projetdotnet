using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeachersController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Teacher>>> GetAll()
    {
        var teachers = await context.Teachers
            .OrderBy(t => t.LastName)
            .ToListAsync();
        return Ok(teachers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Teacher>> Get(int id)
    {
        var teacher = await context.Teachers.FindAsync(id);
        return teacher is null ? NotFound() : Ok(teacher);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Teacher>> Create([FromBody] Teacher teacher)
    {
        context.Teachers.Add(teacher);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = teacher.Id }, teacher);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] Teacher updated)
    {
        var teacher = await context.Teachers.FindAsync(id);
        if (teacher is null) return NotFound();

        teacher.Code = updated.Code;
        teacher.FirstName = updated.FirstName;
        teacher.LastName = updated.LastName;
        teacher.Email = updated.Email;
        teacher.Status = updated.Status;
        teacher.Subject = updated.Subject;
        teacher.Seniority = updated.Seniority;
        teacher.Hours = updated.Hours;
        teacher.Phone = updated.Phone;
        teacher.Department = updated.Department;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var teacher = await context.Teachers.FindAsync(id);
        if (teacher is null) return NotFound();

        context.Teachers.Remove(teacher);
        await context.SaveChangesAsync();
        return NoContent();
    }
}

