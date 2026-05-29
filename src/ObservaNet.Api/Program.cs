using ObservaNet.Api.Endpoints;
using ObservaNet.Api.Services;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

<<<<<<< HEAD
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

builder.Services.AddSingleton<ILogService, InMemoryLogService>();
=======
// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ObservaNet services: queue, processor and a simple file-based indexer for PoC
builder.Services.AddSingleton<ObservaNet.Api.Services.ILogIngestQueue, ObservaNet.Api.Services.LogIngestQueue>();
builder.Services.AddSingleton<ObservaNet.Api.Services.IElasticIndexer, ObservaNet.Api.Services.FileElasticIndexer>();
builder.Services.AddHostedService<ObservaNet.Api.Services.LogBulkProcessor>();
>>>>>>> 5b0ca049d6373e7862acbb156d40dcd4516d95ba

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();
<<<<<<< HEAD
app.MapLogEndpoints();
=======
app.UseAuthorization();
app.MapControllers();
>>>>>>> 5b0ca049d6373e7862acbb156d40dcd4516d95ba

app.Run();

