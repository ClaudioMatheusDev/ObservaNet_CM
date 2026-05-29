namespace ObservaNet.Api.Alerting;

public sealed class AlertRule
{
    public required string Name        { get; init; }
    public required string Description { get; init; }
    public required AlertSeverity Severity { get; init; }
}

public enum AlertSeverity { Info, Warning, Critical }

public sealed class AlertFired
{
    public required AlertRule Rule      { get; init; }
    public required string    Message   { get; init; }
    public DateTimeOffset     FiredAt   { get; init; } = DateTimeOffset.UtcNow;
}
