using ObservaNet.Shared.Models;

namespace ObservaNet.Shared.DTOs

{
    public class LogQueryResponse 
    {
        public List<LogEntry> Logs { get; set; } = new List<LogEntry>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}