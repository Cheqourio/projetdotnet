using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Course>>> GetAll()
    {
        var courses = await context.Courses
            .Include(c => c.Teacher)
            .OrderBy(c => c.Title)
            .ToListAsync();
        return Ok(courses);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Course>> Get(int id)
    {
        var course = await context.Courses
            .Include(c => c.Teacher)
            .FirstOrDefaultAsync(c => c.Id == id);
        return course is null ? NotFound() : Ok(course);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Course>> Create([FromBody] Course course)
    {
        context.Courses.Add(course);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = course.Id }, course);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] Course updated)
    {
        var course = await context.Courses.FindAsync(id);
        if (course is null) return NotFound();

        course.Code = updated.Code;
        course.Title = updated.Title;
        course.Description = updated.Description;
        course.Department = updated.Department;
        course.Level = updated.Level;
        course.Hours = updated.Hours;
        course.Schedule = updated.Schedule;
        course.Status = updated.Status;
        course.TeacherId = updated.TeacherId;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var course = await context.Courses.FindAsync(id);
        if (course is null) return NotFound();

        context.Courses.Remove(course);
        await context.SaveChangesAsync();
        return NoContent();
    }
}

