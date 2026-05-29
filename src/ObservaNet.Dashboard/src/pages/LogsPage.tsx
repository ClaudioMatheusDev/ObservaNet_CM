import React, { useEffect, useState } from 'react';

type ObservaLogLevel = '' | 'Trace' | 'Debug' | 'Information' | 'Warning' | 'Error' | 'Fatal';

interface LogEntry {
  timestamp: string; // ISO string
  service: string;
  level: ObservaLogLevel;
  message: string;
}

export default function LogsPage(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serviceName, setServiceName] = useState<string>('');
  const [level, setLevel] = useState<ObservaLogLevel>('');

  async function fetchLogs(filters?: { service?: string; level?: string }) {
    const params = new URLSearchParams();
    if (filters?.service) params.append('serviceName', filters.service);
    if (filters?.level) params.append('level', filters.level);

    const res = await fetch(`/api/logs?${params.toString()}`);
    if (!res.ok) {
      console.error('Failed to fetch logs');
      return;
    }
    const data = (await res.json()) as LogEntry[];
    setLogs(data);
  }

  useEffect(() => {
    // load logs on mount
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <option value="Trace">Trace</option>
          <option value="Debug">Debug</option>
          <option value="Information">Information</option>
          <option value="Warning">Warning</option>
          <option value="Error">Error</option>
          <option value="Fatal">Fatal</option>
        </select>

        <button
          onClick={() => fetchLogs({ service: serviceName.trim() || undefined, level: level || undefined })}
        >
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
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{l.service}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{l.level}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{l.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
