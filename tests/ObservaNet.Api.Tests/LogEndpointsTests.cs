using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using ObservaNet.Api.Data;
using ObservaNet.Shared.DTOs;
using ObservaNet.Shared.Models;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ObservaNet.Api.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove todos os registros de configuração do DbContext para este contexto
            var optionsType = typeof(DbContextOptions<ObservaNetDbContext>);
            var configType = typeof(IDbContextOptionsConfiguration<ObservaNetDbContext>);

            var toRemove = services
                .Where(d => d.ServiceType == optionsType || d.ServiceType == configType)
                .ToList();

            foreach (var d in toRemove)
                services.Remove(d);

            // Substitui por InMemory para testes
            services.AddDbContext<ObservaNetDbContext>(options =>
                options.UseInMemoryDatabase("IntegrationTestsDb_" + Guid.NewGuid()));
        });
    }
}

public class LogEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public LogEndpointsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostLog_ReturnsCreated()
    {
        var request = new LogIngestRequest
        {
            ServiceName = "teste-service",
            Message = "Mensagem de teste",
            Level = ObservaLogLevel.Information
        };

        var response = await _client.PostAsJsonAsync("/api/logs", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task PostLog_EmptyMessage_ReturnsBadRequest()
    {
        var request = new LogIngestRequest
        {
            ServiceName = "teste-service",
            Message = "",
            Level = ObservaLogLevel.Information
        };

        var response = await _client.PostAsJsonAsync("/api/logs", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetLogs_ReturnsOkWithPaginationFields()
    {
        var response = await _client.GetAsync("/api/logs?page=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<LogQueryResponse>();
        Assert.NotNull(result);
        Assert.NotNull(result.Logs);
        Assert.True(result.Page >= 1);
        Assert.True(result.PageSize >= 1);
    }

    [Fact]
    public async Task GetMetrics_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/logs/metrics");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetHealth_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal("Healthy", body);
    }
}
