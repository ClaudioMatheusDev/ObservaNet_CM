export enum ObservaLogLevel {
  Trace = 0,
  Debug = 1,
  Information = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: ObservaLogLevel;
  message: string;
  serviceName: string;
  exception?: string;
  properties?: Record<string, string>;
}

export interface LogQueryResponse {
  logs: LogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface LogMetrics {
  byLevel: Record<string, number>;
  byService: Record<string, number>;
  totalToday: number;
}
