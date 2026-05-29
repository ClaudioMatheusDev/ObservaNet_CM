import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { interval, Subscription, catchError, of } from 'rxjs';
import { LogMetrics } from '../../models/log.model';
import { LogService } from '../../services/log.service';

@Component({
  selector:        'app-metrics',
  standalone:      true,
  imports:         [DecimalPipe],
  templateUrl:     './metrics.component.html',
  styleUrl:        './metrics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsComponent implements OnInit, OnDestroy {
  private readonly logService = inject(LogService);
  private pollSub?: Subscription;

  readonly metrics = signal<LogMetrics | null>(null);
  readonly error   = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
    this.pollSub = interval(5000).pipe(
      catchError(() => of(null)),
    ).subscribe(() => this.load(true));
  }

  ngOnDestroy(): void { this.pollSub?.unsubscribe(); }

  private load(silent = false): void {
    this.logService.getMetrics().subscribe({
      next:  data => { this.metrics.set(data); this.error.set(null); },
      error: err  => { if (!silent) this.error.set(err.message ?? 'Erro ao carregar métricas.'); },
    });
  }

  barWidth(value: number, max: number): string {
    return max === 0 ? '0%' : `${Math.round((value / max) * 100)}%`;
  }

  levelEntries(): [string, number][] {
    return Object.entries(this.metrics()?.byLevel ?? {});
  }

  serviceEntries(): [string, number][] {
    return Object.entries(this.metrics()?.byService ?? {});
  }

  maxLevel():   number { return Math.max(1, ...Object.values(this.metrics()?.byLevel   ?? {})); }
  maxService(): number { return Math.max(1, ...Object.values(this.metrics()?.byService ?? {})); }

  get errorCount():   number { return this.metrics()?.byLevel?.['Error']    ?? 0; }
  get warningCount(): number { return this.metrics()?.byLevel?.['Warning']  ?? 0; }
  get serviceCount(): number { return Object.keys(this.metrics()?.byService ?? {}).length; }
}
