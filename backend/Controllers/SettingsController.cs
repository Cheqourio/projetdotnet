using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppSetting>>> GetAll()
    {
        var settings = await context.AppSettings.OrderBy(s => s.Key).ToListAsync();
        return Ok(settings);
    }

    [HttpGet("{key}")]
    public async Task<ActionResult<AppSetting>> Get(string key)
    {
        var setting = await context.AppSettings.FirstOrDefaultAsync(s => s.Key == key);
        return setting is null ? NotFound() : Ok(setting);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<AppSetting>> Create(AppSetting setting)
    {
        context.AppSettings.Add(setting);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { key = setting.Key }, setting);
    }

    [HttpPut("{key}")]
    [Authorize]
    public async Task<IActionResult> Update(string key, [FromBody] AppSetting updated)
    {
        var setting = await context.AppSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting is null) return NotFound();

        setting.Value = updated.Value;
        await context.SaveChangesAsync();
        return NoContent();
    }
}

