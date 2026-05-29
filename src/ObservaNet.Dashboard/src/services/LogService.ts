import axios from 'axios';
import type { LogEntry, LogMetrics, LogQueryResponse } from '../types/log';
import { ObservaLogLevel } from '../types/log';

const api = axios.create({
  baseURL: 'http://localhost:5033',
});

export async function fetchLogs(
  serviceName?: string,
  level?: ObservaLogLevel,
  page = 1,
  pageSize = 20
): Promise<LogQueryResponse> {
  const params: Record<string, unknown> = { page, pageSize };
  if (serviceName) params.serviceName = serviceName;
  if (level !== undefined) params.level = level;

  const response = await api.get<LogQueryResponse>('/api/logs', { params });
  return response.data;
}

export async function fetchMetrics(): Promise<LogMetrics> {
  const response = await api.get<LogMetrics>('/api/logs/metrics');
  return response.data;
}

export async function ingestLog(request: Omit<LogEntry, 'id' | 'timestamp'>) {
  const response = await api.post<void>('/api/logs', request);
  return response.data;
}
