using Elastic.Clients.Elasticsearch;
using Microsoft.EntityFrameworkCore;
using ObservaNet.Api.Alerting;
using ObservaNet.Api.Data;
using ObservaNet.Api.Endpoints;
using ObservaNet.Api.Middleware;
using ObservaNet.Api.Services;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, cfg) => cfg.ReadFrom.Configuration(ctx.Configuration));

builder.Services.AddOpenApi();

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var esUri = builder.Configuration["Elasticsearch:Uri"];
if (!string.IsNullOrEmpty(esUri))
{
    var esSettings = new ElasticsearchClientSettings(new Uri(esUri));
    builder.Services.AddSingleton(new ElasticsearchClient(esSettings));
    builder.Services.AddScoped<ILogService, ElasticsearchLogService>();
}
else
{
    builder.Services.AddDbContext<ObservaNetDbContext>(options =>
        options.UseSqlite(
            builder.Configuration.GetConnectionString("Default") ?? "Data Source=observanet.db"));
    builder.Services.AddScoped<ILogService, EfLogService>();
}

builder.Services.AddHealthChecks();
builder.Services.AddScoped<AlertService>();

var app = builder.Build();

if (string.IsNullOrEmpty(app.Configuration["Elasticsearch:Uri"]))
{
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<ObservaNetDbContext>().Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UsePerformanceTracking();

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.MapLogEndpoints();
app.MapAlertEndpoints();
app.MapHealthChecks("/health");

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
}

// Necessário para WebApplicationFactory nos testes de integração
public partial class Program { }

