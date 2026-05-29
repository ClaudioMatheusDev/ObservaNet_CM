using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using ObservaNet.Shared.Dtos;

namespace ObservaNet.Api.Services
{
    // Simple PoC indexer that writes events as JSON lines to a dated file.
    public class FileElasticIndexer : IElasticIndexer
    {
        private readonly string _basePath;

        public FileElasticIndexer()
        {
            _basePath = Path.Combine(AppContext.BaseDirectory, "es_mock");
            Directory.CreateDirectory(_basePath);
        }

        public async Task IndexBulkAsync(IEnumerable<LogEventDto> events)
        {
            var now = DateTime.UtcNow;
            var fileName = Path.Combine(_basePath, $"observanet-logs-{now:yyyy.MM.dd}.ndjson");
            await using var stream = new FileStream(fileName, FileMode.Append, FileAccess.Write, FileShare.Read);
            await using var writer = new StreamWriter(stream);
            foreach (var ev in events)
            {
                var json = JsonSerializer.Serialize(ev);
                await writer.WriteLineAsync(json);
            }
        }
    }
}
