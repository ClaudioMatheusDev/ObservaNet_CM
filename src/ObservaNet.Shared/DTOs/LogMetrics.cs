namespace ObservaNet.Shared.DTOs;

public class LogMetrics
{
    public Dictionary<string, int> ByLevel { get; set; } = new();
    public Dictionary<string, int> ByService { get; set; } = new();
    public int TotalToday { get; set; }
}
