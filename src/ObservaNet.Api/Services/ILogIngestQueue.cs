using System.Collections.Generic;
using System.Threading.Tasks;
using ObservaNet.Shared.Dtos;

namespace ObservaNet.Api.Services
{
    public interface ILogIngestQueue
    {
        ValueTask EnqueueAsync(IEnumerable<LogEventDto> events);
    }
}
