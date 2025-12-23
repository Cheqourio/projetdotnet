using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasCharSet("utf8mb4");

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasIndex(s => s.Email).IsUnique();
            entity.Property(s => s.Average).HasPrecision(4, 2);
            entity.Property(s => s.Code).HasMaxLength(20);
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasIndex(t => t.Email).IsUnique();
            entity.Property(t => t.Code).HasMaxLength(20);
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasIndex(c => c.Code).IsUnique();
            entity.HasOne(c => c.Teacher)
                  .WithMany(t => t.Courses)
                  .HasForeignKey(c => c.TeacherId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasIndex(e => new { e.StudentId, e.CourseId }).IsUnique();
            entity.Property(e => e.Score).HasPrecision(4, 2);
            entity.Property(e => e.Code).HasMaxLength(20);
            entity.HasOne(e => e.Student)
                  .WithMany(s => s.Enrollments)
                  .HasForeignKey(e => e.StudentId);
            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Enrollments)
                  .HasForeignKey(e => e.CourseId);
        });

        modelBuilder.Entity<AppSetting>(entity =>
        {
            entity.HasIndex(s => s.Key).IsUnique();
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasIndex(a => a.Email).IsUnique();
        });
    }
}

