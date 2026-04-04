import { Counter, Histogram, Registry } from 'prom-client';

export const metricsRegister = new Registry();

export const httpRequestsTotal = new Counter({
  name: 'dispatcher_http_requests_total',
  help: 'Total HTTP requests handled by the dispatcher',
  labelNames: ['method', 'route_group', 'status_code'],
  registers: [metricsRegister],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'dispatcher_http_request_duration_seconds',
  help: 'Duration of dispatcher request handling in seconds',
  labelNames: ['method', 'route_group'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegister],
});

export function routeGroupFromPath(path: string): string {
  if (path.startsWith('/api/v1/auth')) {
    return 'auth';
  }
  if (path.startsWith('/api/v1/products')) {
    return 'product';
  }
  if (path.startsWith('/api/v1/orders')) {
    return 'order';
  }
  if (path.startsWith('/gateway/admin')) {
    return 'gateway_admin';
  }
  if (path === '/metrics') {
    return 'metrics';
  }
  return 'other';
}
