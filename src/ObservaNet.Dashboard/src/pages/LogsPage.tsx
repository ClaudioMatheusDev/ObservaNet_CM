import { useEffect, useState } from 'react';
import { ObservaLogLevel, type LogEntry } from '../types/log';
import { fetchLogs as fetchLogsService } from '../services/logService';

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serviceName, setServiceName] = useState('');
  const [level, setLevel] = useState<ObservaLogLevel | ''>('');

  async function loadLogs() {
    const data = await fetchLogsService(
      serviceName.trim() || undefined,
      level !== '' ? level : undefined
    );
    setLogs(data.logs);
  }

  useEffect(() => {
    loadLogs();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ padding: 16 }}>
      <h2>Logs</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input
          placeholder="Serviço"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
        />

        <select value={level} onChange={(e) => setLevel(e.target.value as ObservaLogLevel)}>
          <option value="">Todos os níveis</option>
          <option value={ObservaLogLevel.Trace}>Trace</option>
          <option value={ObservaLogLevel.Debug}>Debug</option>
          <option value={ObservaLogLevel.Information}>Information</option>
          <option value={ObservaLogLevel.Warning}>Warning</option>
          <option value={ObservaLogLevel.Error}>Error</option>
          <option value={ObservaLogLevel.Critical}>Critical</option>
        </select>

        <button onClick={loadLogs}>
          Buscar
        </button>
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
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{l.level}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{l.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
