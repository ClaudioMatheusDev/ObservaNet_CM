using ObservaNet.Api.Services;
using ObservaNet.Shared.Models;

namespace ObservaNet.Api.Alerting;

public sealed class AlertService
{
    private readonly ILogService _logService;
    private readonly ILogger<AlertService> _logger;

    // Regras com limiares configuráveis
    private static readonly AlertRule HighErrorRate = new()
    {
        Name        = "high-error-rate",
        Description = "Taxa de erros (Error + Critical) acima de 20% no total do dia",
        Severity    = AlertSeverity.Critical,
    };

    private static readonly AlertRule SlowRequestsDetected = new()
    {
        Name        = "slow-requests-detected",
        Description = "Presença de logs de Warning com prefixo SLOW REQUEST",
        Severity    = AlertSeverity.Warning,
    };

    public AlertService(ILogService logService, ILogger<AlertService> logger)
    {
        _logService = logService;
        _logger     = logger;
    }

    public async Task<IReadOnlyList<AlertFired>> EvaluateAsync()
    {
        var fired   = new List<AlertFired>();
        var metrics = await _logService.GetMetricsAsync();

        // ── Regra 1: taxa de erros ─────────────────────────────────────────────
        var errors   = metrics.ByLevel.GetValueOrDefault(nameof(ObservaLogLevel.Error),    0)
                     + metrics.ByLevel.GetValueOrDefault(nameof(ObservaLogLevel.Critical),  0);
        var total    = metrics.ByLevel.Values.Sum();

        if (total > 0)
        {
            var errorRate = errors / (double)total;
            if (errorRate >= 0.20)
            {
                var alert = new AlertFired
                {
                    Rule    = HighErrorRate,
                    Message = $"Taxa de erros é {errorRate:P0} ({errors}/{total} logs hoje).",
                };
                fired.Add(alert);
                _logger.LogWarning("[ALERT] {Name}: {Message}", alert.Rule.Name, alert.Message);
            }
        }

        // ── Regra 2: chamadas lentas ───────────────────────────────────────────
        var slowResult = await _logService.QueryLogsAsync(
            serviceName: null,
            level: ObservaLogLevel.Warning,
            from: DateTimeOffset.UtcNow.Date,
            to: null,
            page: 1,
            pageSize: 1);

        if (slowResult.TotalCount > 0)
        {
            var alert = new AlertFired
            {
                Rule    = SlowRequestsDetected,
                Message = $"{slowResult.TotalCount} Warning(s) registrados hoje — verifique chamadas lentas.",
            };
            fired.Add(alert);
            _logger.LogWarning("[ALERT] {Name}: {Message}", alert.Rule.Name, alert.Message);
        }

        return fired;
    }
}
