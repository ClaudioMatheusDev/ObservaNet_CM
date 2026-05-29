using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Resilience;

namespace ObservaNet.Agent;
public static class ObservaNetExtensions
{
    public static void AddObservaNet(this IServiceCollection services, string apiUrl)
    {
        services.AddHttpClient<ObservaNetClient>(client =>
        {
            client.BaseAddress = new Uri(apiUrl);
        })
        .AddStandardResilienceHandler(); // retry automático com backoff exponencial
    }
}