using ObservaNet.Shared.Models;

namespace ObservaNet.Shared.DTOs

{
    public class LogIngestRequest 
    {
        public required string ServiceName { get; set; }
        public required string Message { get; set; }
        public ObservaLogLevel Level { get; set; }
        public string? Exception { get; set; }
        public Dictionary<string, string>? Properties { get; set; }
    }
}