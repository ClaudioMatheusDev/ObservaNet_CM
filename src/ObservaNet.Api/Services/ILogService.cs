using ObservaNet.Shared.DTOs;
using ObservaNet.Shared.Models;

namespace ObservaNet.Api.Services
{
    public interface ILogService
    {
        Task IngestLogAsync(LogIngestRequest request);
        Task<LogQueryResponse> QueryLogsAsync(string? serviceName, ObservaLogLevel? level, DateTimeOffset? from, DateTimeOffset? to, int page, int pageSize);
        Task<LogMetrics> GetMetricsAsync();
    }
}