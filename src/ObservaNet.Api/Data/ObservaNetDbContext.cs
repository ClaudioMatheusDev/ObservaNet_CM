using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ObservaNet.Shared.Models;
using System.Text.Json;

namespace ObservaNet.Api.Data;

public class ObservaNetDbContext : DbContext
{
    public ObservaNetDbContext(DbContextOptions<ObservaNetDbContext> options) : base(options) { }

    public DbSet<LogEntry> Logs => Set<LogEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var conv = new ValueConverter<Dictionary<string, string>?, string?>(
            v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => v == null ? null : JsonSerializer.Deserialize<Dictionary<string, string>>(v, (JsonSerializerOptions?)null)
        );

        var cmp = new ValueComparer<Dictionary<string, string>?>(
            (a, b) => JsonSerializer.Serialize(a, (JsonSerializerOptions?)null) == JsonSerializer.Serialize(b, (JsonSerializerOptions?)null),
            c => c == null ? 0 : JsonSerializer.Serialize(c, (JsonSerializerOptions?)null).GetHashCode(),
            c => c == null ? null : JsonSerializer.Deserialize<Dictionary<string, string>>(
                JsonSerializer.Serialize(c, (JsonSerializerOptions?)null), (JsonSerializerOptions?)null)
        );

        modelBuilder.Entity<LogEntry>()
            .Property(e => e.Properties)
            .HasConversion(conv, cmp);

        // SQLite não suporta DateTimeOffset em ORDER BY/WHERE — armazena como ticks (long)
        modelBuilder.Entity<LogEntry>()
            .Property(e => e.Timestamp)
            .HasConversion(
                v => v.UtcTicks,
                v => new DateTimeOffset(v, TimeSpan.Zero)
            );

        // Índices para consultas frequentes
        modelBuilder.Entity<LogEntry>().HasIndex(e => e.Timestamp);
        modelBuilder.Entity<LogEntry>().HasIndex(e => e.Level);
        modelBuilder.Entity<LogEntry>().HasIndex(e => e.ServiceName);
    }
}
