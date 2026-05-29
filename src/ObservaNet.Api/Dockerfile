# ── Build ──────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore — aproveita cache de layers se os .csproj não mudarem
COPY ["src/ObservaNet.Api/ObservaNet.Api.csproj",    "src/ObservaNet.Api/"]
COPY ["src/ObservaNet.Shared/ObservaNet.Shared.csproj", "src/ObservaNet.Shared/"]
RUN dotnet restore "src/ObservaNet.Api/ObservaNet.Api.csproj"

# Copiar fontes e publicar
COPY src/ObservaNet.Api/    src/ObservaNet.Api/
COPY src/ObservaNet.Shared/ src/ObservaNet.Shared/
RUN dotnet publish "src/ObservaNet.Api/ObservaNet.Api.csproj" \
    -c Release -o /app/publish --no-restore

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ObservaNet.Api.dll"]
