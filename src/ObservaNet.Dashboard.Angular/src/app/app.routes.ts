import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',        loadComponent: () => import('./pages/logs/logs.component').then(m => m.LogsComponent) },
  { path: 'metrics', loadComponent: () => import('./pages/metrics/metrics.component').then(m => m.MetricsComponent) },
  { path: '**',      redirectTo: '' },
];
