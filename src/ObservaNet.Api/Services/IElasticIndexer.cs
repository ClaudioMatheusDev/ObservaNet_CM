using System.Collections.Generic;
using System.Threading.Tasks;
using ObservaNet.Shared.Dtos;

namespace ObservaNet.Api.Services
{
    public interface IElasticIndexer
    {
        Task IndexBulkAsync(IEnumerable<LogEventDto> events);
    }
}
