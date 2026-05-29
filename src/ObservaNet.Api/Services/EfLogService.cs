using Microsoft.EntityFrameworkCore;
using ObservaNet.Api.Data;
using ObservaNet.Shared.DTOs;
using ObservaNet.Shared.Models;

namespace ObservaNet.Api.Services;

public class EfLogService : ILogService
{
    private readonly ObservaNetDbContext _context;

    public EfLogService(ObservaNetDbContext context)
    {
        _context = context;
    }

    public async Task IngestLogAsync(LogIngestRequest request)
    {
        _context.Logs.Add(new LogEntry
        {
            Id = Guid.NewGuid(),
            ServiceName = request.ServiceName,
            Message = request.Message,
            Level = request.Level,
            Exception = request.Exception,
            Properties = request.Properties,
            Timestamp = DateTimeOffset.UtcNow
        });
        await _context.SaveChangesAsync();
    }

    public async Task<LogQueryResponse> QueryLogsAsync(
        string? serviceName, ObservaLogLevel? level,
        DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize)
    {
        var query = _context.Logs.AsQueryable();

        if (!string.IsNullOrEmpty(serviceName))
            query = query.Where(l => l.ServiceName.ToLower() == serviceName.ToLower());

        if (level.HasValue)
            query = query.Where(l => l.Level == level.Value);

        if (from.HasValue)
            query = query.Where(l => l.Timestamp >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.Timestamp <= to.Value);

        var totalCount = await query.CountAsync();
        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new LogQueryResponse
        {
            Logs = logs,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<LogMetrics> GetMetricsAsync()
    {
        var levelGroups = await _context.Logs
            .GroupBy(l => l.Level)
            .Select(g => new { Level = g.Key, Count = g.Count() })
            .ToListAsync();

        var serviceGroups = await _context.Logs
            .GroupBy(l => l.ServiceName)
            .Select(g => new { Service = g.Key, Count = g.Count() })
            .ToListAsync();

        var todayStart = new DateTimeOffset(DateTimeOffset.UtcNow.Date, TimeSpan.Zero);
        var totalToday = await _context.Logs.CountAsync(l => l.Timestamp >= todayStart);

        return new LogMetrics
        {
            ByLevel = levelGroups.ToDictionary(g => g.Level.ToString(), g => g.Count),
            ByService = serviceGroups.ToDictionary(g => g.Service, g => g.Count),
            TotalToday = totalToday
        };
    }
}
