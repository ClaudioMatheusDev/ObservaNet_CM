import { useEffect, useState } from 'react';
import type { LogMetrics } from '../types/log';
import { fetchMetrics } from '../services/LogService';

const LEVEL_COLORS: Record<string, { bar: string; badge: string; text: string }> = {
  Critical: { bar: '#be185d', badge: '#fdf2f8', text: '#9d174d' },
  Error:    { bar: '#dc2626', badge: '#fef2f2', text: '#b91c1c' },
  Warning:  { bar: '#d97706', badge: '#fffbeb', text: '#b45309' },
  Information: { bar: '#2563eb', badge: '#eff6ff', text: '#1d4ed8' },
  Debug:    { bar: '#6b7280', badge: '#f9fafb', text: '#4b5563' },
  Trace:    { bar: '#d1d5db', badge: '#f9fafb', text: '#9ca3af' },
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    padding: '32px 28px',
    background: '#0f1117',
    minHeight: '100vh',
    color: '#e2e8f0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottom: '0.5px solid #1e2535',
  },
  titleGroup: { display: 'flex', flexDirection: 'column', gap: 2 },
  eyebrow: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: '#4a5568',
  },
  pageTitle: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 20,
    fontWeight: 500,
    color: '#f1f5f9',
    margin: 0,
  },
  refreshBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: '#34d399',
    background: 'rgba(52,211,153,0.1)',
    border: '0.5px solid rgba(52,211,153,0.2)',
    padding: '4px 12px',
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#34d399',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 12,
    marginBottom: 36,
  },
  kpiCard: {
    background: '#161b27',
    border: '0.5px solid #1e2535',
    borderRadius: 10,
    padding: '16px 18px',
  },
  kpiLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#4a5568',
    marginBottom: 8,
  },
  kpiValue: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 30,
    fontWeight: 500,
    lineHeight: 1,
    color: '#60a5fa',
  },
  sectionLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#4a5568',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottom: '0.5px solid #1e2535',
  },
  section: { marginBottom: 32 },
  barRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9 },
  barName: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    color: '#94a3b8',
    width: 108,
    textAlign: 'right' as const,
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: 7,
    background: '#1e2535',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barCount: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    color: '#4a5568',
    width: 40,
    textAlign: 'right' as const,
    flexShrink: 0,
  },
  footer: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: '#2d3748',
    textAlign: 'right' as const,
    marginTop: 8,
  },
  loading: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13,
    color: '#4a5568',
    padding: '32px 28px',
    background: '#0f1117',
    minHeight: '100vh',
  },
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<LogMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics()
      .then(data => { setMetrics(data); setError(null); })
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar métricas.'));
    const id = setInterval(() => {
      fetchMetrics()
        .then(data => { setMetrics(data); setError(null); })
        .catch(() => { /* silencia erro de polling */ });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!metrics) {
    return (
      <div style={styles.loading}>
        {error
          ? <span style={{ color: '#f87171' }}>{error}</span>
          : 'carregando métricas…'}
      </div>
    );
  }

  const maxLevel   = Math.max(1, ...Object.values(metrics.byLevel));
  const maxService = Math.max(1, ...Object.values(metrics.byService));

  const errorCount    = metrics.byLevel['Error']    ?? 0;
  const warningCount  = metrics.byLevel['Warning']  ?? 0;
  const serviceCount  = Object.keys(metrics.byService).length;

  return (
    <div style={styles.page}>
      {/* Erro */}
      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.1)',
          border: '0.5px solid rgba(220,38,38,0.3)',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: '#f87171',
        }}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <span style={styles.eyebrow}>ObservaNET_CM</span>
          <h2 style={styles.pageTitle}>Métricas</h2>
        </div>
        <div style={styles.refreshBadge}>
          <span style={styles.dot} />
          auto-refresh 5s
        </div>
      </div>

      {/* KPI cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Logs hoje</div>
          <div style={styles.kpiValue}>{metrics.totalToday.toLocaleString('pt-BR')}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Erros</div>
          <div style={{ ...styles.kpiValue, color: '#f87171' }}>{errorCount}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Avisos</div>
          <div style={{ ...styles.kpiValue, color: '#fbbf24' }}>{warningCount}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Serviços</div>
          <div style={{ ...styles.kpiValue, color: '#e2e8f0' }}>{serviceCount}</div>
        </div>
      </div>

      {/* Por nível */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Distribuição por nível</div>
        {Object.entries(metrics.byLevel).length === 0 ? (
          <p style={{ color: '#4a5568', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
            Nenhum dado ainda.
          </p>
        ) : (
          Object.entries(metrics.byLevel).map(([lvl, count]) => (
            <div key={lvl} style={styles.barRow}>
              <span style={styles.barName}>{lvl}</span>
              <div style={styles.barTrack}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((count / maxLevel) * 100)}%`,
                  background: LEVEL_COLORS[lvl]?.bar ?? '#4a5568',
                  borderRadius: 2,
                  minWidth: 3,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <span style={styles.barCount}>{count}</span>
            </div>
          ))
        )}
      </div>

      {/* Por serviço */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Distribuição por serviço</div>
        {Object.entries(metrics.byService).length === 0 ? (
          <p style={{ color: '#4a5568', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
            Nenhum dado ainda.
          </p>
        ) : (
          Object.entries(metrics.byService).map(([svc, count]) => (
            <div key={svc} style={styles.barRow}>
              <span style={{ ...styles.barName, width: 140 }}>{svc}</span>
              <div style={styles.barTrack}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((count / maxService) * 100)}%`,
                  background: '#2563eb',
                  borderRadius: 2,
                  minWidth: 3,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <span style={styles.barCount}>{count}</span>
            </div>
          ))
        )}
      </div>

      <div style={styles.footer}>última atualização: agora</div>
    </div>
  );
}