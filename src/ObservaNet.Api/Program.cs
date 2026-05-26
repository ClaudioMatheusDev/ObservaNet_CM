var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ObservaNet services: queue, processor and a simple file-based indexer for PoC
builder.Services.AddSingleton<ObservaNet.Api.Services.ILogIngestQueue, ObservaNet.Api.Services.LogIngestQueue>();
builder.Services.AddSingleton<ObservaNet.Api.Services.IElasticIndexer, ObservaNet.Api.Services.FileElasticIndexer>();
builder.Services.AddHostedService<ObservaNet.Api.Services.LogBulkProcessor>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
