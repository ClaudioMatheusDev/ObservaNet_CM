using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ObservaNet.Api.Services
{
    public class LogBulkProcessor : BackgroundService
    {
        private readonly ILogIngestQueue _queue;
        private readonly IElasticIndexer _indexer;
        private readonly ILogger<LogBulkProcessor> _logger;

        private readonly int _batchSize = 100;
        private readonly TimeSpan _batchInterval = TimeSpan.FromSeconds(5);

        public LogBulkProcessor(ILogIngestQueue queue, IElasticIndexer indexer, ILogger<LogBulkProcessor> logger)
        {
            _queue = queue;
            _indexer = indexer;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("LogBulkProcessor started");
            var reader = ((LogIngestQueue)_queue).Reader;

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var batch = new List<ObservaNet.Shared.Dtos.LogEventDto>(_batchSize);
                    var first = await reader.ReadAsync(stoppingToken);
                    batch.Add(first);

                    var sw = System.Diagnostics.Stopwatch.StartNew();
                    while (batch.Count < _batchSize && sw.Elapsed < _batchInterval)
                    {
                        while (reader.TryRead(out var item))
                        {
                            batch.Add(item);
                            if (batch.Count >= _batchSize) break;
                        }
                        if (batch.Count >= _batchSize) break;
                        await Task.Delay(50, stoppingToken);
                    }

                    // send to indexer
                    await _indexer.IndexBulkAsync(batch);
                    _logger.LogInformation("Indexed {Count} events", batch.Count);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    // shutting down
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in LogBulkProcessor loop");
                    await Task.Delay(1000, stoppingToken);
                }
            }
            _logger.LogInformation("LogBulkProcessor stopping");
        }
    }
}
