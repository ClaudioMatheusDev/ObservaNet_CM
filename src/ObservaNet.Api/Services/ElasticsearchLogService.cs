using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Aggregations;
using Elastic.Clients.Elasticsearch.QueryDsl;
using ObservaNet.Shared.DTOs;
using ObservaNet.Shared.Models;

namespace ObservaNet.Api.Services;

public sealed class ElasticsearchLogService : ILogService
{
    private readonly ElasticsearchClient _client;
    private const string IndexPattern = "observanet-logs-*";

    public ElasticsearchLogService(ElasticsearchClient client)
    {
        _client = client;
    }

    private static string DailyIndex() =>
        $"observanet-logs-{DateTimeOffset.UtcNow:yyyy.MM.dd}";

    public async Task IngestLogAsync(LogIngestRequest request)
    {
        var entry = new LogEntry
        {
            Id          = Guid.NewGuid(),
            ServiceName = request.ServiceName,
            Message     = request.Message,
            Level       = request.Level,
            Exception   = request.Exception,
            Properties  = request.Properties,
            Timestamp   = DateTimeOffset.UtcNow,
        };

        await _client.IndexAsync(entry, i => i
            .Index(DailyIndex())
            .Id(entry.Id.ToString()));
    }

    public async Task<LogQueryResponse> QueryLogsAsync(
        string? serviceName, ObservaLogLevel? level,
        DateTimeOffset? from, DateTimeOffset? to,
        int page, int pageSize)
    {
        // Clonar variáveis para captura segura nos lambdas
        var svcFilter   = serviceName;
        var lvlFilter   = level.HasValue ? (int?)((int)level.Value) : null;
        var fromFilter  = from;
        var toFilter    = to;

        var musts = new List<Action<QueryDescriptor<LogEntry>>>();

        if (!string.IsNullOrEmpty(svcFilter))
            musts.Add(m => m.Term(t => t.Field(new Field("serviceName.keyword")).Value(svcFilter)));

        if (lvlFilter.HasValue)
        {
            var lvl = lvlFilter.Value;
            musts.Add(m => m.Term(t => t.Field(f => f.Level).Value(lvl)));
        }

        if (fromFilter.HasValue || toFilter.HasValue)
        {
            var f = fromFilter;
            var t = toFilter;
            musts.Add(m => m.Range(r => r.DateRange(dr =>
            {
                dr.Field(f2 => f2.Timestamp);
                if (f.HasValue) dr.Gte(f.Value.UtcDateTime);
                if (t.HasValue) dr.Lte(t.Value.UtcDateTime);
            })));
        }

        var response = await _client.SearchAsync<LogEntry>(s =>
        {
            s.Index(IndexPattern)
             .From((page - 1) * pageSize)
             .Size(pageSize)
             .Sort(srt => srt.Field(f => f.Timestamp, fs => fs.Order(SortOrder.Desc)));

            if (musts.Count > 0)
                s.Query(q => q.Bool(b => b.Must(musts.ToArray())));
            else
                s.Query(q => q.MatchAll(new MatchAllQuery()));
        });

        return new LogQueryResponse
        {
            Logs       = response.Hits.Select(h => h.Source!).ToList(),
            TotalCount = (int)(response.HitsMetadata?.Total?.Match(th => th.Value, l => l) ?? 0),
            Page       = page,
            PageSize   = pageSize,
        };
    }

    public async Task<LogMetrics> GetMetricsAsync()
    {
        var todayStart = DateTime.UtcNow.Date;

        var response = await _client.SearchAsync<LogEntry>(s => s
            .Index(IndexPattern)
            .Size(0)
            .Aggregations(aggs =>
            {
                aggs.Add("by_level",   a => a.Terms(t => t.Field(f => f.Level).Size(10)));
                aggs.Add("by_service", a => a.Terms(t => t.Field("serviceName.keyword").Size(100)));
                aggs.Add("today",      a => a.Filter(q => q.Range(r => r.DateRange(dr => dr
                    .Field(f => f.Timestamp)
                    .Gte(todayStart)))));
                return aggs;
            })
        );

        var byLevel = new Dictionary<string, int>();
        var levelBuckets = response.Aggregations?.GetLongTerms("by_level")?.Buckets;
        if (levelBuckets is not null)
            foreach (var b in levelBuckets)
                byLevel[((ObservaLogLevel)(int)b.Key).ToString()] = (int)b.DocCount;

        var byService = new Dictionary<string, int>();
        var serviceBuckets = response.Aggregations?.GetStringTerms("by_service")?.Buckets;
        if (serviceBuckets is not null)
            foreach (var b in serviceBuckets)
                byService[b.Key.ToString()!] = (int)b.DocCount;

        var totalToday = (int)(response.Aggregations?.GetFilter("today")?.DocCount ?? 0);

        return new LogMetrics
        {
            ByLevel    = byLevel,
            ByService  = byService,
            TotalToday = totalToday,
        };
    }
}
