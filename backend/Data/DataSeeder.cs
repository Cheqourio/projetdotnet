using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class DataSeeder(ApplicationDbContext context, IConfiguration configuration, ILogger<DataSeeder> logger)
{
    public async Task SeedAsync()
    {
        await context.Database.MigrateAsync();

        if (!await context.AdminUsers.AnyAsync())
        {
            var adminEmail = configuration["SeedAdmin:Email"] ?? "admin@school.com";
            var adminPassword = configuration["SeedAdmin:Password"] ?? "Admin123!";

            context.AdminUsers.Add(new AdminUser
            {
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = "admin"
            });

            logger.LogInformation("Admin par défaut créé ({Email})", adminEmail);
        }

        if (!await context.AppSettings.AnyAsync())
        {
            context.AppSettings.AddRange(
                new AppSetting { Key = "school.name", Value = "Académie Digitale" },
                new AppSetting { Key = "school.address", Value = "123 Avenue de la Connaissance, Rabat" },
                new AppSetting { Key = "school.supportEmail", Value = "support@school.com" },
                new AppSetting { Key = "school.timezone", Value = "GMT+1 (Casablanca)" }
            );
        }

        if (!await context.Courses.AnyAsync())
        {
            var seedCourses = new[]
            {
                new Course { Code = "CRS-RESEAUX", Title = "Réseaux", Status = "Ouvert", Level = "IIR", Description = "Fondamentaux des réseaux et protocoles." },
                new Course { Code = "CRS-WEB", Title = "Développement web", Status = "Ouvert", Level = "IIR", Description = "Front-end et back-end web modernes." },
                new Course { Code = "CRS-EMBAR", Title = "Systèmes embarqués", Status = "Ouvert", Level = "IIR", Description = "Programmation bas niveau et microcontrôleurs." },
                new Course { Code = "CRS-CYBER", Title = "Cybersécurité", Status = "Ouvert", Level = "IIR", Description = "Sécurisation des systèmes et réseau." },
                new Course { Code = "CRS-DATA", Title = "Data science", Status = "Ouvert", Level = "IIR", Description = "Analyse de données et statistiques appliquées." },
                new Course { Code = "CRS-IA", Title = "Intelligence artificielle", Status = "Ouvert", Level = "IIR", Description = "Bases de l'IA, modèles et applications." },
                new Course { Code = "CRS-CLOUD", Title = "Cloud & DevOps", Status = "Ouvert", Level = "IIR", Description = "CI/CD, conteneurs et infrastructures cloud." },
                new Course { Code = "CRS-BDD", Title = "Bases de données", Status = "Ouvert", Level = "IIR", Description = "Modélisation, SQL et optimisation." },
                new Course { Code = "CRS-ALGO", Title = "Algorithmique", Status = "Ouvert", Level = "IIR", Description = "Structures de données et complexité." },
                new Course { Code = "CRS-ARCHI", Title = "Architecture systèmes", Status = "Ouvert", Level = "IIR", Description = "Conception et architecture des SI." },
            };

            context.Courses.AddRange(seedCourses);
            logger.LogInformation("10 cours de base ajoutés pour correspondre aux spécialités.");
        }

        if (!await context.Teachers.AnyAsync())
        {
            var seedTeachers = new[]
            {
                new Teacher
                {
                    Code = "TCH-001",
                    FirstName = "Ahmed",
                    LastName = "Benali",
                    Email = "ahmed.benali@school.com",
                    Status = "Actif",
                    Subject = "Réseaux",
                    Seniority = "8 ans",
                    Hours = "20h",
                    Phone = "+212 6 12 34 56 78",
                    Department = "Informatique"
                },
                new Teacher
                {
                    Code = "TCH-002",
                    FirstName = "Fatima",
                    LastName = "Alaoui",
                    Email = "fatima.alaoui@school.com",
                    Status = "Actif",
                    Subject = "Développement web",
                    Seniority = "6 ans",
                    Hours = "18h",
                    Phone = "+212 6 23 45 67 89",
                    Department = "Informatique"
                },
                new Teacher
                {
                    Code = "TCH-003",
                    FirstName = "Mohamed",
                    LastName = "Idrissi",
                    Email = "mohamed.idrissi@school.com",
                    Status = "Disponible",
                    Subject = "Systèmes embarqués",
                    Seniority = "10 ans",
                    Hours = "22h",
                    Phone = "+212 6 34 56 78 90",
                    Department = "Informatique"
                },
                new Teacher
                {
                    Code = "TCH-004",
                    FirstName = "Aicha",
                    LastName = "Tazi",
                    Email = "aicha.tazi@school.com",
                    Status = "Actif",
                    Subject = "Cybersécurité",
                    Seniority = "7 ans",
                    Hours = "16h",
                    Phone = "+212 6 45 67 89 01",
                    Department = "Informatique"
                },
                new Teacher
                {
                    Code = "TCH-005",
                    FirstName = "Youssef",
                    LastName = "Bennani",
                    Email = "youssef.bennani@school.com",
                    Status = "Actif",
                    Subject = "Data science",
                    Seniority = "5 ans",
                    Hours = "20h",
                    Phone = "+212 6 56 78 90 12",
                    Department = "Informatique"
                },
                new Teacher
                {
                    Code = "TCH-006",
                    FirstName = "Sanae",
                    LastName = "El Amrani",
                    Email = "sanae.elamrani@school.com",
                    Status = "Actif",
                    Subject = "Intelligence artificielle",
                    Seniority = "9 ans",
                    Hours = "18h",
                    Phone = "+212 6 67 89 01 23",
                    Department = "Informatique"
                },
                new Teacher
                {
                    Code = "TCH-007",
                    FirstName = "Karim",
                    LastName = "Chraibi",
                    Email = "karim.chraibi@school.com",
                    Status = "Disponible",
                    Subject = "Cloud & DevOps",
                    Seniority = "4 ans",
                    Hours = "20h",
                    Phone = "+212 6 78 90 12 34",
                    Department = "Informatique"
                },
                new Teacher
                {
                    Code = "TCH-008",
                    FirstName = "Nadia",
                    LastName = "Fassi",
                    Email = "nadia.fassi@school.com",
                    Status = "Actif",
                    Subject = "Bases de données",
                    Seniority = "11 ans",
                    Hours = "16h",
                    Phone = "+212 6 89 01 23 45",
                    Department = "Informatique"
                },
                new Teacher
                {
                    Code = "TCH-009",
                    FirstName = "Omar",
                    LastName = "Berrada",
                    Email = "omar.berrada@school.com",
                    Status = "Actif",
                    Subject = "Algorithmique",
                    Seniority = "12 ans",
                    Hours = "22h",
                    Phone = "+212 6 90 12 34 56",
                    Department = "Informatique"
                }
            };

            context.Teachers.AddRange(seedTeachers);
            logger.LogInformation("9 enseignants de base ajoutés.");
        }

        if (!await context.Students.AnyAsync())
        {
            var seedStudents = new[]
            {
                new Student
                {
                    Code = "STU-001",
                    FirstName = "Youssef",
                    LastName = "Alami",
                    Email = "youssef.alami@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "1IIR",
                    Status = "Actif",
                    Average = 15.5m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Student
                {
                    Code = "STU-002",
                    FirstName = "Sara",
                    LastName = "Bennani",
                    Email = "sara.bennani@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "1IIR",
                    Status = "Actif",
                    Average = 16.2m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Student
                {
                    Code = "STU-003",
                    FirstName = "Mehdi",
                    LastName = "Chraibi",
                    Email = "mehdi.chraibi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "1IIR",
                    Status = "En attente",
                    Average = 12.8m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Student
                {
                    Code = "STU-004",
                    FirstName = "Amina",
                    LastName = "El Fassi",
                    Email = "amina.elfassi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "2IIR",
                    Status = "Actif",
                    Average = 17.5m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Student
                {
                    Code = "STU-005",
                    FirstName = "Omar",
                    LastName = "Idrissi",
                    Email = "omar.idrissi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "2IIR",
                    Status = "Actif",
                    Average = 14.3m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new Student
                {
                    Code = "STU-006",
                    FirstName = "Fatima",
                    LastName = "Alaoui",
                    Email = "fatima.alaoui@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "2IIR",
                    Status = "Actif",
                    Average = 18.1m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Student
                {
                    Code = "STU-007",
                    FirstName = "Karim",
                    LastName = "Tazi",
                    Email = "karim.tazi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "2IIR",
                    Status = "Suspendu",
                    Average = 9.5m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new Student
                {
                    Code = "STU-008",
                    FirstName = "Nadia",
                    LastName = "Berrada",
                    Email = "nadia.berrada@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "3IIR",
                    Status = "Actif",
                    Average = 16.8m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new Student
                {
                    Code = "STU-009",
                    FirstName = "Hassan",
                    LastName = "Benali",
                    Email = "hassan.benali@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "3IIR",
                    Status = "Actif",
                    Average = 15.0m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-6)
                },
                new Student
                {
                    Code = "STU-010",
                    FirstName = "Laila",
                    LastName = "El Amrani",
                    Email = "laila.elamrani@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "3IIR",
                    Status = "Actif",
                    Average = 17.9m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Student
                {
                    Code = "STU-011",
                    FirstName = "Rachid",
                    LastName = "Bennani",
                    Email = "rachid.bennani@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "3IIR",
                    Status = "En attente",
                    Average = 13.2m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-12)
                },
                new Student
                {
                    Code = "STU-012",
                    FirstName = "Salma",
                    LastName = "Chraibi",
                    Email = "salma.chraibi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "3IIR",
                    Status = "Actif",
                    Average = 16.5m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Student
                {
                    Code = "STU-013",
                    FirstName = "Amine",
                    LastName = "Idrissi",
                    Email = "amine.idrissi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "4IIR",
                    Status = "Actif",
                    Average = 18.5m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Student
                {
                    Code = "STU-014",
                    FirstName = "Imane",
                    LastName = "Tazi",
                    Email = "imane.tazi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "4IIR",
                    Status = "Actif",
                    Average = 17.2m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Student
                {
                    Code = "STU-015",
                    FirstName = "Bilal",
                    LastName = "Alami",
                    Email = "bilal.alami@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "4IIR",
                    Status = "Actif",
                    Average = 15.8m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-8)
                },
                new Student
                {
                    Code = "STU-016",
                    FirstName = "Zineb",
                    LastName = "El Fassi",
                    Email = "zineb.elfassi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "4IIR",
                    Status = "En attente",
                    Average = 11.5m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-20)
                },
                new Student
                {
                    Code = "STU-017",
                    FirstName = "Anass",
                    LastName = "Berrada",
                    Email = "anass.berrada@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "4IIR",
                    Status = "Actif",
                    Average = 16.3m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new Student
                {
                    Code = "STU-018",
                    FirstName = "Houda",
                    LastName = "Benali",
                    Email = "houda.benali@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "4IIR",
                    Status = "Actif",
                    Average = 14.7m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-6)
                },
                new Student
                {
                    Code = "STU-019",
                    FirstName = "Yassine",
                    LastName = "Alaoui",
                    Email = "yassine.alaoui@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "5IIR",
                    Status = "Actif",
                    Average = 18.8m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Student
                {
                    Code = "STU-020",
                    FirstName = "Sanae",
                    LastName = "El Amrani",
                    Email = "sanae.elamrani@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "5IIR",
                    Status = "Actif",
                    Average = 17.6m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Student
                {
                    Code = "STU-021",
                    FirstName = "Reda",
                    LastName = "Bennani",
                    Email = "reda.bennani@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "5IIR",
                    Status = "Actif",
                    Average = 16.0m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new Student
                {
                    Code = "STU-022",
                    FirstName = "Khadija",
                    LastName = "Chraibi",
                    Email = "khadija.chraibi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "5IIR",
                    Status = "Actif",
                    Average = 19.2m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Student
                {
                    Code = "STU-023",
                    FirstName = "Tarik",
                    LastName = "Idrissi",
                    Email = "tarik.idrissi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "5IIR",
                    Status = "Actif",
                    Average = 15.4m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Student
                {
                    Code = "STU-024",
                    FirstName = "Meriem",
                    LastName = "Tazi",
                    Email = "meriem.tazi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "5IIR",
                    Status = "Suspendu",
                    Average = 8.9m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Student
                {
                    Code = "STU-025",
                    FirstName = "Hamza",
                    LastName = "Alami",
                    Email = "hamza.alami@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "1IIR",
                    Status = "Actif",
                    Average = 13.8m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-9)
                },
                new Student
                {
                    Code = "STU-026",
                    FirstName = "Aicha",
                    LastName = "El Fassi",
                    Email = "aicha.elfassi@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "1IIR",
                    Status = "Actif",
                    Average = 16.7m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new Student
                {
                    Code = "STU-027",
                    FirstName = "Mohamed",
                    LastName = "Berrada",
                    Email = "mohamed.berrada@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "2IIR",
                    Status = "En attente",
                    Average = 10.5m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-18)
                },
                new Student
                {
                    Code = "STU-028",
                    FirstName = "Nour",
                    LastName = "Benali",
                    Email = "nour.benali@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "3IIR",
                    Status = "Actif",
                    Average = 17.3m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Student
                {
                    Code = "STU-029",
                    FirstName = "Adil",
                    LastName = "Alaoui",
                    Email = "adil.alaoui@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "4IIR",
                    Status = "Actif",
                    Average = 14.9m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-6)
                },
                new Student
                {
                    Code = "STU-030",
                    FirstName = "Ibtissam",
                    LastName = "El Amrani",
                    Email = "ibtissam.elamrani@student.school.com",
                    Program = "Ingénieur Informatique et Réseaux",
                    Level = "5IIR",
                    Status = "Actif",
                    Average = 18.4m,
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                }
            };

            context.Students.AddRange(seedStudents);
            logger.LogInformation("30 étudiants de base ajoutés.");
        }

        await context.SaveChangesAsync();
    }
}

