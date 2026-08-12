using Assignment_Desk.Middleware;
using AssignmentDesk.Application.Interfaces.IAuth;
using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Application.Interfaces.IRepository.Common;
using AssignmentDesk.Application.Interfaces.IServices;
using AssignmentDesk.Application.Interfaces.IUnitOfWork;
using AssignmentDesk.Application.Mapping;
using AssignmentDesk.Application.Services;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories;
using AssignmentDesk.Infrastructure.Repositories.Auth;
using AssignmentDesk.Infrastructure.Repositories.Common;
using AssignmentDesk.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design.Internal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


//for logger
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File(
        "Logs/log-.txt",
        rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();



builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var clientUrl = builder.Configuration["AppSettings:ClientBaseUrl"];
        var origins = new List<string> { "http://localhost:3000", "https://localhost:3000" };
        if (!string.IsNullOrEmpty(clientUrl))
        {
            origins.Add(clientUrl.TrimEnd('/'));
        }

        policy.WithOrigins(origins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "AssignmentDesk.Api", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IClassRepository,ClassRepository>();
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<ITeacherSubjectRepository, TeacherSubjectRepository>();
builder.Services.AddScoped<IStudentClassRepository, StudentClassRepository>();
builder.Services.AddScoped<IAssignmentRepository, AssignmentRepository>();
builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();

builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<ISubjectService,SubjectService>();
builder.Services.AddScoped<ITeacherSubjectService, TeacherSubjectService>();
builder.Services.AddScoped<IStudentClassService, StudentClassService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<ISubmissionService, SubmissionService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<UnitOfWork>();

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<UserProfile>();
    cfg.AddProfile<ClassProfile>();
    cfg.AddProfile<SubjectProfile>();
    cfg.AddProfile<TeacherSubjectProfile>();
    cfg.AddProfile<StudentClassProfile>();
    cfg.AddProfile<AssignmentProfile>();
    cfg.AddProfile<SubmissionProfile>();
});


builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddScoped<IEmailService, EmailService>();



var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services
.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider
        .GetRequiredService<ApplicationDbContext>();

    await context.Database.MigrateAsync();
    await DbSeeder.SeedAdminAsync(context);
}


//health check
app.MapGet("/health", () => Results.Ok("OK"));


app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

