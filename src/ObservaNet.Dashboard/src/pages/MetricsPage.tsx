import { useEffect, useState } from 'react';
import type { LogMetrics } from '../types/log';
import { fetchMetrics } from '../services/logService';

const LEVEL_COLORS: Record<string, string> = {
  Trace: '#9e9e9e',
  Debug: '#607d8b',
  Information: '#2196f3',
  Warning: '#ff9800',
  Error: '#f44336',
  Critical: '#880e4f',
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<LogMetrics | null>(null);

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch(console.error);
    const id = setInterval(() => {
      fetchMetrics().then(setMetrics).catch(console.error);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!metrics) {
    return <div style={{ padding: 16 }}>Carregando métricas...</div>;
  }

  const maxLevel = Math.max(1, ...Object.values(metrics.byLevel));
  const maxService = Math.max(1, ...Object.values(metrics.byService));

  return (
    <div style={{ padding: 16 }}>
      <h2>Métricas</h2>

      <div style={{ marginBottom: 24, padding: '12px 20px', background: '#f5f5f5', borderRadius: 8, display: 'inline-block' }}>
        <span style={{ fontSize: 14, color: '#555' }}>Logs hoje</span>
        <div style={{ fontSize: 36, fontWeight: 'bold', color: '#1a1a2e' }}>{metrics.totalToday}</div>
      </div>

      <h3>Por Nível</h3>
      {Object.entries(metrics.byLevel).length === 0 ? (
        <p style={{ color: '#888' }}>Nenhum dado ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(metrics.byLevel).map(([lvl, count]) => (
            <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 110, textAlign: 'right', fontSize: 13, color: '#444' }}>{lvl}</span>
              <div style={{
                height: 22,
                width: `${Math.round((count / maxLevel) * 260)}px`,
                background: LEVEL_COLORS[lvl] ?? '#4a90e2',
                borderRadius: 4,
                minWidth: 4,
              }} />
              <span style={{ fontSize: 13, color: '#333' }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: 28 }}>Por Serviço</h3>
      {Object.entries(metrics.byService).length === 0 ? (
        <p style={{ color: '#888' }}>Nenhum dado ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(metrics.byService).map(([svc, count]) => (
            <div key={svc} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 150, textAlign: 'right', fontSize: 13, color: '#444' }}>{svc}</span>
              <div style={{
                height: 22,
                width: `${Math.round((count / maxService) * 260)}px`,
                background: '#4caf50',
                borderRadius: 4,
                minWidth: 4,
              }} />
              <span style={{ fontSize: 13, color: '#333' }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: 20, fontSize: 12, color: '#aaa' }}>Auto-refresh: 5s</p>
    </div>
  );
}
