using System.Diagnostics;

namespace ObservaNet.Api.Middleware;

public sealed class PerformanceMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<PerformanceMiddleware> _logger;

    // Limiar (ms) acima do qual o request é considerado lento
    private const int SlowRequestThresholdMs = 500;

    public PerformanceMiddleware(RequestDelegate next, ILogger<PerformanceMiddleware> logger)
    {
        _next   = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();
            var ms         = sw.ElapsedMilliseconds;
            var method     = context.Request.Method;
            var path       = context.Request.Path;
            var statusCode = context.Response.StatusCode;

            if (ms >= SlowRequestThresholdMs)
            {
                _logger.LogWarning(
                    "SLOW REQUEST {Method} {Path} responded {StatusCode} in {DurationMs} ms",
                    method, path, statusCode, ms);
            }
            else
            {
                _logger.LogInformation(
                    "{Method} {Path} responded {StatusCode} in {DurationMs} ms",
                    method, path, statusCode, ms);
            }
        }
    }
}

public static class PerformanceMiddlewareExtensions
{
    public static IApplicationBuilder UsePerformanceTracking(this IApplicationBuilder app)
        => app.UseMiddleware<PerformanceMiddleware>();
}
