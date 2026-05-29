using ObservaNet.Api.Services;
using ObservaNet.Shared.DTOs;
using ObservaNet.Shared.Models;

namespace ObservaNet.Api.Tests;

public class InMemoryLogServiceTests
{
    private static InMemoryLogService CreateService() => new();

    [Fact]
    public async Task IngestAsync_ShouldAddLogToList()
    {
        var service = CreateService();

        await service.IngestLogAsync(new LogIngestRequest
        {
            ServiceName = "TestApp",
            Message = "Hello World",
            Level = ObservaLogLevel.Information
        });

        var result = await service.QueryLogsAsync(null, null, null, null, 1, 20);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Hello World", result.Logs[0].Message);
        Assert.Equal("TestApp", result.Logs[0].ServiceName);
    }

    [Fact]
    public async Task QueryAsync_FilterByLevel_ShouldReturnOnlyMatchingLogs()
    {
        var service = CreateService();

        await service.IngestLogAsync(new LogIngestRequest
        {
            ServiceName = "App",
            Message = "Info log",
            Level = ObservaLogLevel.Information
        });

        await service.IngestLogAsync(new LogIngestRequest
        {
            ServiceName = "App",
            Message = "Error log",
            Level = ObservaLogLevel.Error
        });

        var result = await service.QueryLogsAsync(null, ObservaLogLevel.Error, null, null, 1, 20);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(ObservaLogLevel.Error, result.Logs[0].Level);
        Assert.Equal("Error log", result.Logs[0].Message);
    }

    [Fact]
    public async Task QueryAsync_FilterByServiceName_ShouldReturnOnlyMatchingLogs()
    {
        var service = CreateService();

        await service.IngestLogAsync(new LogIngestRequest
        {
            ServiceName = "ServiceA",
            Message = "Log from A",
            Level = ObservaLogLevel.Information
        });

        await service.IngestLogAsync(new LogIngestRequest
        {
            ServiceName = "ServiceB",
            Message = "Log from B",
            Level = ObservaLogLevel.Information
        });

        var result = await service.QueryLogsAsync("ServiceA", null, null, null, 1, 20);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("ServiceA", result.Logs[0].ServiceName);
    }
}
