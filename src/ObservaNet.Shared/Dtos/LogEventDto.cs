using System;
using System.Collections.Generic;

namespace ObservaNet.Shared.Dtos
{
    public class LogEventDto
    {
        public DateTime Timestamp { get; set; }
        public string Level { get; set; } = "Information";
        public string Service { get; set; } = string.Empty;
        public string Environment { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Exception { get; set; }
        public string? TraceId { get; set; }
        public string? SpanId { get; set; }
        public string? HttpMethod { get; set; }
        public string? HttpPath { get; set; }
        public int? HttpStatusCode { get; set; }
        public double? DurationMs { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
    }
}
