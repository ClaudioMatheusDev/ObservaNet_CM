using ObservaNet.Api.Alerting;

namespace ObservaNet.Api.Endpoints;

public static class AlertEndpoints
{
    public static void MapAlertEndpoints(this WebApplication app)
    {
        app.MapGet("/api/alerts", async (AlertService alertService) =>
        {
            var fired = await alertService.EvaluateAsync();
            return Results.Ok(fired);
        });
    }
}
