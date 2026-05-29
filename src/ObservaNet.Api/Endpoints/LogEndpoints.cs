using ObservaNet.Api.Services;
using ObservaNet.Shared.DTOs;
using ObservaNet.Shared.Models;

namespace ObservaNet.Api.Endpoints
{
    public static class LogEndpoints
    {
        public static void MapLogEndpoints(this WebApplication app)
        {
            app.MapPost("/api/logs", async (LogIngestRequest request, ILogService logService) =>
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                    return Results.BadRequest(new { error = "Message é obrigatório." });
                if (string.IsNullOrWhiteSpace(request.ServiceName))
                    return Results.BadRequest(new { error = "ServiceName é obrigatório." });

                await logService.IngestLogAsync(request);
                return Results.Created("/api/logs", null);
            });

            app.MapGet("/api/logs", async (string? serviceName, ObservaLogLevel? level, DateTimeOffset? from, DateTimeOffset? to, int page, int pageSize, ILogService logService) =>
            {
                var result = await logService.QueryLogsAsync(serviceName, level, from, to, page, pageSize);
                return Results.Ok(result);
            });

            app.MapGet("/api/logs/metrics", async (ILogService logService) =>
            {
                var metrics = await logService.GetMetricsAsync();
                return Results.Ok(metrics);
            });
        }
    }
}