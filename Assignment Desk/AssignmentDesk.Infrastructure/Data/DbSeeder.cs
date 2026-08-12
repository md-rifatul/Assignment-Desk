using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminAsync(ApplicationDbContext context)
        {
            var adminExists = await context.Users
                .AnyAsync(x => x.Role == UserRole.Admin);

            if (adminExists)
                return;

            var admin = new User
            {
                FullName = "System Admin",
                Email = "admin@assignmentdesk.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@123"),
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(admin);

            await context.SaveChangesAsync();
        }
    }
}
