using ObservaNet.Shared.DTOs;
using ObservaNet.Shared.Models;

namespace ObservaNet.Api.Services
{
    public class InMemoryLogService : ILogService
    {
        private readonly List<LogEntry> _logs = [];

        public Task IngestLogAsync(LogIngestRequest request)
        {
            var logEntry = new LogEntry
            {
                Id = Guid.NewGuid(),
                ServiceName = request.ServiceName,
                Message = request.Message,
                Level = request.Level,
                Exception = request.Exception,
                Properties = request.Properties,
                Timestamp = DateTimeOffset.UtcNow
            };

            _logs.Add(logEntry);
            return Task.CompletedTask;
        }

        public Task<LogQueryResponse> QueryLogsAsync(string? serviceName, ObservaLogLevel? level, DateTimeOffset? from, DateTimeOffset? to, int page, int pageSize)
        {
            var query = _logs.AsQueryable();

            if (!string.IsNullOrEmpty(serviceName))
            {
                query = query.Where(log => log.ServiceName.Equals(serviceName, StringComparison.OrdinalIgnoreCase));
            }

            if (level.HasValue)
            {
                query = query.Where(log => log.Level == level.Value);
            }

            if (from.HasValue)
            {
                query = query.Where(log => log.Timestamp >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(log => log.Timestamp <= to.Value);
            }

            var totalCount = query.Count();
            var logsPage = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return Task.FromResult(new LogQueryResponse
            {
                Logs = logsPage,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        public Task<LogMetrics> GetMetricsAsync()
        {
            var byLevel = _logs
                .GroupBy(l => l.Level.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            var byService = _logs
                .GroupBy(l => l.ServiceName)
                .ToDictionary(g => g.Key, g => g.Count());

            var todayStart = new DateTimeOffset(DateTimeOffset.UtcNow.Date, TimeSpan.Zero);
            var totalToday = _logs.Count(l => l.Timestamp >= todayStart);

            return Task.FromResult(new LogMetrics
            {
                ByLevel = byLevel,
                ByService = byService,
                TotalToday = totalToday
            });
        }
    }
}