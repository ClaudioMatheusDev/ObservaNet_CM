using System.Collections.Generic;

namespace ObservaNet.Shared.Dtos
{
    public class BulkLogRequest
    {
        public List<LogEventDto> Events { get; set; } = new List<LogEventDto>();
    }
}
