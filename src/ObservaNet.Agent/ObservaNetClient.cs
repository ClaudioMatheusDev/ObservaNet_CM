using System.Net.Http.Json;
using ObservaNet.Shared.DTOs;

namespace ObservaNet.Agent;

public class ObservaNetClient
{
    private readonly HttpClient _httpClient;

    public ObservaNetClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task SendLogAsync(LogIngestRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync("/api/logs", request);
        response.EnsureSuccessStatusCode();
    }
}