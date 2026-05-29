using Microsoft.AspNetCore.Mvc;
using ObservaNet.Shared.Dtos;
using ObservaNet.Api.Services;
using System.Threading.Tasks;
using System.Linq;

namespace ObservaNet.Api.Controllers
{
    [ApiController]
    [Route("api/logs")]
    public class LogsController : ControllerBase
    {
        private readonly ILogIngestQueue _queue;

        public LogsController(ILogIngestQueue queue)
        {
            _queue = queue;
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> PostBulk([FromBody] BulkLogRequest request)
        {
            if (request == null || request.Events == null || !request.Events.Any())
            {
                return BadRequest(new { error = "events required" });
            }

            // simple validation example
            var invalid = request.Events.Where(e => e.Timestamp == default).ToList();
            if (invalid.Any())
            {
                return BadRequest(new { error = "some events missing timestamp" });
            }

            await _queue.EnqueueAsync(request.Events);
            return Accepted();
        }
    }
}
