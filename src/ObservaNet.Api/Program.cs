using Microsoft.EntityFrameworkCore;
using ObservaNet.Api.Data;
using ObservaNet.Api.Endpoints;
using ObservaNet.Api.Services;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<ObservaNetDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("Default") ?? "Data Source=observanet.db"));

builder.Services.AddScoped<ILogService, EfLogService>();

builder.Services.AddHealthChecks();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<ObservaNetDbContext>().Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();
app.MapLogEndpoints();
app.MapHealthChecks("/health");

app.Run();

// Necessário para WebApplicationFactory nos testes de integração
public partial class Program { }

