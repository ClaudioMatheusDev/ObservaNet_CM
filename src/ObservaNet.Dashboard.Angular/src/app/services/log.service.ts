import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LogMetrics, LogQueryResponse, ObservaLogLevel } from '../models/log.model';

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly http = inject(HttpClient);

  queryLogs(
    serviceName?: string,
    level?: ObservaLogLevel,
    page = 1,
    pageSize = 20,
  ): Observable<LogQueryResponse> {
    let params = new HttpParams()
      .set('page',     page)
      .set('pageSize', pageSize);

    if (serviceName) params = params.set('serviceName', serviceName);
    if (level !== undefined) params = params.set('level', level);

    return this.http.get<LogQueryResponse>('/api/logs', { params });
  }

  getMetrics(): Observable<LogMetrics> {
    return this.http.get<LogMetrics>('/api/logs/metrics');
  }
}
