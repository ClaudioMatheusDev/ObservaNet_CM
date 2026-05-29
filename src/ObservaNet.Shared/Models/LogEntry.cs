namespace ObservaNet.Shared.Models
{
    public class LogEntry
    {

        public Guid Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public ObservaLogLevel Level { get; set; }
        public required string Message { get; set; }

        public required string ServiceName { get; set; }
        public string? Exception { get; set; }
        public Dictionary<string, string>? Properties { get; set; }
    }
}

