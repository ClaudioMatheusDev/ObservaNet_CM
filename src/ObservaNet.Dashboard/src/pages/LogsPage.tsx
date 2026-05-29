import { useEffect, useRef, useState } from 'react';
import { ObservaLogLevel, type LogEntry } from '../types/log';
import { fetchLogs as fetchLogsService } from '../services/LogService';

const PAGE_SIZE = 20;

const LEVEL_STYLE: Record<string, { bg: string; color: string }> = {
  [ObservaLogLevel.Critical]:    { bg: 'rgba(190,24,93,0.15)',  color: '#f472b6' },
  [ObservaLogLevel.Error]:       { bg: 'rgba(220,38,38,0.12)',  color: '#f87171' },
  [ObservaLogLevel.Warning]:     { bg: 'rgba(217,119,6,0.12)',  color: '#fbbf24' },
  [ObservaLogLevel.Information]: { bg: 'rgba(37,99,235,0.12)',  color: '#60a5fa' },
  [ObservaLogLevel.Debug]:       { bg: 'rgba(100,116,139,0.12)',color: '#94a3b8' },
  [ObservaLogLevel.Trace]:       { bg: 'rgba(71,85,105,0.08)',  color: '#64748b' },
};

const s: Record<string, React.CSSProperties> = {
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
    marginBottom: 24,
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
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#34d399' },
  filterBar: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' },
  input: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    background: '#161b27',
    color: '#e2e8f0',
    border: '0.5px solid #1e2535',
    borderRadius: 8,
    padding: '8px 12px',
    outline: 'none',
    flex: 1,
  },
  select: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    background: '#161b27',
    color: '#e2e8f0',
    border: '0.5px solid #1e2535',
    borderRadius: 8,
    padding: '8px 10px',
    outline: 'none',
    cursor: 'pointer',
  },
  searchBtn: {
    fontFamily: "'IBM Plex Sans', monospace",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.04em',
    background: '#161b27',
    color: '#94a3b8',
    border: '0.5px solid #1e2535',
    borderRadius: 8,
    padding: '8px 18px',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  },
  tableWrap: {
    background: '#161b27',
    border: '0.5px solid #1e2535',
    borderRadius: 10,
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#4a5568',
    fontWeight: 500,
    padding: '10px 14px',
    textAlign: 'left' as const,
    borderBottom: '0.5px solid #1e2535',
    background: '#0f1117',
  },
  td: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    padding: '10px 14px',
    borderBottom: '0.5px solid #1a2030',
    color: '#94a3b8',
    verticalAlign: 'middle' as const,
  },
  tdTimestamp: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    padding: '10px 14px',
    borderBottom: '0.5px solid #1a2030',
    color: '#4a5568',
    whiteSpace: 'nowrap' as const,
    verticalAlign: 'middle' as const,
  },
  tdService: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    padding: '10px 14px',
    borderBottom: '0.5px solid #1a2030',
    color: '#cbd5e1',
    verticalAlign: 'middle' as const,
  },
  tdMessage: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    padding: '10px 14px',
    borderBottom: '0.5px solid #1a2030',
    color: '#e2e8f0',
    maxWidth: 320,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    verticalAlign: 'middle' as const,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pagInfo: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: '#4a5568',
  },
  pagButtons: { display: 'flex', gap: 6 },
  pagBtn: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    background: '#161b27',
    color: '#64748b',
    border: '0.5px solid #1e2535',
    borderRadius: 8,
    padding: '6px 14px',
    cursor: 'pointer',
  },
  pagBtnDisabled: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    background: '#161b27',
    color: '#2d3748',
    border: '0.5px solid #1a202c',
    borderRadius: 8,
    padding: '6px 14px',
    cursor: 'default',
    opacity: 0.4,
  },
  emptyRow: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    color: '#4a5568',
    padding: '32px 14px',
    textAlign: 'center' as const,
  },
};

function LevelBadge({ level }: { level: ObservaLogLevel }) {
  const name = ObservaLogLevel[level];
  const style = LEVEL_STYLE[level] ?? { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: 4,
      background: style.bg,
      color: style.color,
    }}>
      {name}
    </span>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serviceName, setServiceName] = useState('');
  const [level, setLevel] = useState<ObservaLogLevel | ''>('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const filtersRef = useRef({ serviceName, level, page });
  filtersRef.current = { serviceName, level, page };

  async function loadLogs(p = page) {
    try {
      const data = await fetchLogsService(
        serviceName.trim() || undefined,
        level !== '' ? level : undefined,
        p,
        PAGE_SIZE
      );
      setLogs(data.logs);
      setTotalCount(data.totalCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs.');
    }
  }

  useEffect(() => { loadLogs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(async () => {
      const f = filtersRef.current;
      try {
        const data = await fetchLogsService(
          f.serviceName.trim() || undefined,
          f.level !== '' ? f.level as ObservaLogLevel : undefined,
          f.page,
          PAGE_SIZE
        );
        setLogs(data.logs);
        setTotalCount(data.totalCount);
        setError(null);
      } catch {
        // silencia erro de polling — o usuário vê o último estado
      }
    }, 5000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() { setPage(1); loadLogs(1); }
  function handlePrev() { const p = Math.max(1, page - 1); setPage(p); loadLogs(p); }
  function handleNext() { const p = Math.min(totalPages, page + 1); setPage(p); loadLogs(p); }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.titleGroup}>
          <span style={s.eyebrow}>ObservaNET_CM</span>
          <h2 style={s.pageTitle}>Logs</h2>
        </div>
        <div style={s.refreshBadge}>
          <span style={s.dot} />
          auto-refresh 5s
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.1)',
          border: '0.5px solid rgba(220,38,38,0.3)',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 12,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: '#f87171',
        }}>
          {error}
        </div>
      )}

      {/* Filtros */}
      <div style={s.filterBar}>
        <input
          style={s.input}
          placeholder="Filtrar por serviço…"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <select
          style={s.select}
          value={level}
          onChange={(e) => setLevel(e.target.value as ObservaLogLevel | '')}
        >
          <option value="">Todos os níveis</option>
          <option value={ObservaLogLevel.Trace}>Trace</option>
          <option value={ObservaLogLevel.Debug}>Debug</option>
          <option value={ObservaLogLevel.Information}>Information</option>
          <option value={ObservaLogLevel.Warning}>Warning</option>
          <option value={ObservaLogLevel.Error}>Error</option>
          <option value={ObservaLogLevel.Critical}>Critical</option>
        </select>
        <button style={s.searchBtn} onClick={handleSearch}>Buscar</button>
      </div>

      {/* Tabela */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Timestamp</th>
              <th style={s.th}>Serviço</th>
              <th style={s.th}>Nível</th>
              <th style={s.th}>Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={s.emptyRow}>nenhum log encontrado</td>
              </tr>
            ) : (
              logs.map((l, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  <td style={s.tdTimestamp}>{new Date(l.timestamp).toLocaleString('pt-BR')}</td>
                  <td style={s.tdService}>{l.serviceName}</td>
                  <td style={s.td}><LevelBadge level={l.level} /></td>
                  <td style={s.tdMessage} title={l.message}>{l.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div style={s.pagination}>
        <span style={s.pagInfo}>
          página {page} de {totalPages} &nbsp;·&nbsp; {totalCount.toLocaleString('pt-BR')} logs
        </span>
        <div style={s.pagButtons}>
          <button
            style={page <= 1 ? s.pagBtnDisabled : s.pagBtn}
            onClick={handlePrev}
            disabled={page <= 1}
          >
            ← anterior
          </button>
          <button
            style={page >= totalPages ? s.pagBtnDisabled : s.pagBtn}
            onClick={handleNext}
            disabled={page >= totalPages}
          >
            próxima →
          </button>
        </div>
      </div>
    </div>
  );
}