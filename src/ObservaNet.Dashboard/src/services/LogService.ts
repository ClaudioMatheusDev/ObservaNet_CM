import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5033',
});

export interface FetchLogsParams {
  serviceName?: string;
  level?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchLogs(
  serviceName?: string,
  level?: string,
  page = 1,
  pageSize = 20
) {
  const params: Record<string, any> = { page, pageSize };
  if (serviceName) params.serviceName = serviceName;
  if (level) params.level = level;

  const response = await api.get('/api/logs', { params });
  return response.data;
}

export async function ingestLog(request: unknown) {
  const response = await api.post('/api/logs', request);
  return response.data;
}

export default {
  fetchLogs,
  ingestLog,
};
