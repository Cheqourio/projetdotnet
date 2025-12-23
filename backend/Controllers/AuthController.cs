using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

public record LoginRequest(string Email, string Password);

[ApiController]
[Route("api/[controller]")]
public class AuthController(ApplicationDbContext context, IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
    {
        var admin = await context.AdminUsers.FirstOrDefaultAsync(a => a.Email == request.Email);
        if (admin is null || !BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
        {
            return Unauthorized(new { message = "Identifiants invalides" });
        }

        var token = GenerateJwtToken(admin.Email, admin.Role);
        return Ok(new { token, admin.Email, admin.Role });
    }

    private string GenerateJwtToken(string email, string role)
    {
        var jwtSection = configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

