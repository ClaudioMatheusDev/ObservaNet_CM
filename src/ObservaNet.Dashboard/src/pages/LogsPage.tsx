import { useEffect, useRef, useState } from 'react';
import { ObservaLogLevel, type LogEntry } from '../types/log';
import { fetchLogs as fetchLogsService } from '../services/logService';

const PAGE_SIZE = 20;

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serviceName, setServiceName] = useState('');
  const [level, setLevel] = useState<ObservaLogLevel | ''>('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Ref pattern: o intervalo sempre lê os filtros/página mais recentes
  const filtersRef = useRef({ serviceName, level, page });
  filtersRef.current = { serviceName, level, page };

  async function loadLogs(p = page) {
    const data = await fetchLogsService(
      serviceName.trim() || undefined,
      level !== '' ? level : undefined,
      p,
      PAGE_SIZE
    );
    setLogs(data.logs);
    setTotalCount(data.totalCount);
  }

  // Carga inicial
  useEffect(() => {
    loadLogs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh a cada 5 segundos
  useEffect(() => {
    const id = setInterval(async () => {
      const f = filtersRef.current;
      const data = await fetchLogsService(
        f.serviceName.trim() || undefined,
        f.level !== '' ? f.level as ObservaLogLevel : undefined,
        f.page,
        PAGE_SIZE
      );
      setLogs(data.logs);
      setTotalCount(data.totalCount);
    }, 5000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() {
    setPage(1);
    loadLogs(1);
  }

  function handlePrev() {
    const p = Math.max(1, page - 1);
    setPage(p);
    loadLogs(p);
  }

  function handleNext() {
    const p = Math.min(totalPages, page + 1);
    setPage(p);
    loadLogs(p);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Logs</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input
          placeholder="Serviço"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <select value={level} onChange={(e) => setLevel(e.target.value as ObservaLogLevel | '')}>
          <option value="">Todos os níveis</option>
          <option value={ObservaLogLevel.Trace}>Trace</option>
          <option value={ObservaLogLevel.Debug}>Debug</option>
          <option value={ObservaLogLevel.Information}>Information</option>
          <option value={ObservaLogLevel.Warning}>Warning</option>
          <option value={ObservaLogLevel.Error}>Error</option>
          <option value={ObservaLogLevel.Critical}>Critical</option>
        </select>

        <button onClick={handleSearch}>Buscar</button>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>Auto-refresh: 5s</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Timestamp</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Serviço</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Nível</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Mensagem</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={i}>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                {new Date(l.timestamp).toLocaleString()}
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{l.serviceName}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{ObservaLogLevel[l.level]}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{l.message}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <button onClick={handlePrev} disabled={page <= 1}>&#171; Anterior</button>
        <span>Página {page} de {totalPages} &nbsp;|&nbsp; {totalCount} logs no total</span>
        <button onClick={handleNext} disabled={page >= totalPages}>Próxima &#187;</button>
      </div>
    </div>
  );
}
