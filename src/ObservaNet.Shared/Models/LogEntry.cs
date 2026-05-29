using System.ComponentModel.DataAnnotations;

namespace ObservaNet.Shared.Models
{
    public class LogEntry
    {

        public Guid Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public ObservaLogLevel Level { get; set; }

        [MaxLength(2000)]
        public required string Message { get; set; }

        [MaxLength(100)]
        public required string ServiceName { get; set; }

        [MaxLength(4000)]
        public string? Exception { get; set; }
        public Dictionary<string, string>? Properties { get; set; }
    }
}

