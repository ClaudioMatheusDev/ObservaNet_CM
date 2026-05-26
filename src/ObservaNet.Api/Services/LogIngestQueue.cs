using System.Threading.Channels;
using System.Collections.Generic;
using System.Threading.Tasks;
using ObservaNet.Shared.Dtos;

namespace ObservaNet.Api.Services
{
    public class LogIngestQueue : ILogIngestQueue
    {
        private readonly Channel<LogEventDto> _channel;

        public LogIngestQueue()
        {
            // Bounded channel to avoid uncontrolled memory growth
            var options = new BoundedChannelOptions(10000)
            {
                FullMode = BoundedChannelFullMode.Wait
            };
            _channel = Channel.CreateBounded<LogEventDto>(options);
        }

        public async ValueTask EnqueueAsync(IEnumerable<LogEventDto> events)
        {
            foreach (var ev in events)
            {
                await _channel.Writer.WriteAsync(ev);
            }
        }

        public ChannelReader<LogEventDto> Reader => _channel.Reader;
    }
}
