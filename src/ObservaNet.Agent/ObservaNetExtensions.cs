using Microsoft.Extensions.DependencyInjection;

namespace ObservaNet.Agent;
public static class ObservaNetExtensions
{
    public static void AddObservaNet(this IServiceCollection services, string apiUrl)
    {
        var baseAddress = new Uri(apiUrl);
        services.AddHttpClient<ObservaNetClient>(client =>
        {
            client.BaseAddress = baseAddress;
        });
    }
}