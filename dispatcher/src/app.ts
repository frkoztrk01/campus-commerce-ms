import express, { type Express, type Request, type Response } from 'express';
import type { GatewayInboundRequest } from './domain/interfaces';
import type { GatewayProxyOrchestrator } from './application/GatewayProxyOrchestrator';
import type { TrafficLogBuffer } from './infrastructure/observability/TrafficLogBuffer';
import { renderAdminLogsHtml } from './infrastructure/observability/adminLogsHtml';
import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  metricsRegister,
  routeGroupFromPath,
} from './infrastructure/observability/metrics';

export interface CreateAppOptions {
  readonly orchestrator: GatewayProxyOrchestrator;
  /** When set, recent requests are retained for the admin log endpoints. */
  readonly trafficLogBuffer?: TrafficLogBuffer;
  /** When non-null, enables `/gateway/admin/logs` and `/gateway/admin/logs-ui`. */
  readonly adminLogToken?: string | null;
}

function toInboundRequest(req: Request): GatewayInboundRequest {
  const queryIndex = req.url.indexOf('?');
  const query = queryIndex >= 0 ? req.url.slice(queryIndex) : '';
  return {
    method: req.method,
    path: req.path,
    query,
    headers: req.headers as Record<string, string | string[] | undefined>,
    rawBody: req.body,
  };
}

function sendProxied(res: Response, statusCode: number, body: string, headers: Record<string, string>): void {
  res.status(statusCode);
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    if (lower === 'transfer-encoding') {
      continue;
    }
    res.setHeader(key, value);
  }
  const contentType = headers['content-type'] ?? headers['Content-Type'];
  if (contentType && contentType.includes('application/json')) {
    try {
      res.json(JSON.parse(body));
      return;
    } catch {
      res.send(body);
      return;
    }
  }
  res.send(body);
}

function hrtimeMs(start: bigint): number {
  return Number(process.hrtime.bigint() - start) / 1e6;
}

function recordObservability(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  buffer: TrafficLogBuffer | undefined,
  skipBuffer: boolean,
): void {
  const group = routeGroupFromPath(path);
  httpRequestsTotal.inc({ method, route_group: group, status_code: String(statusCode) });
  httpRequestDurationSeconds.observe({ method, route_group: group }, durationMs / 1000);
  if (!skipBuffer && buffer) {
    buffer.push({
      timestamp: new Date().toISOString(),
      method,
      path,
      statusCode,
      durationMs: Math.round(durationMs),
    });
  }
}

function readAdminToken(req: Request): string | undefined {
  const header = req.headers['x-admin-token'];
  if (typeof header === 'string' && header.length > 0) {
    return header;
  }
  const q = req.query['token'];
  if (typeof q === 'string' && q.length > 0) {
    return q;
  }
  return undefined;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  const buffer = options.trafficLogBuffer;
  const adminToken = options.adminLogToken;

  app.get('/metrics', async (_req, res) => {
    const started = process.hrtime.bigint();
    try {
      res.setHeader('Content-Type', metricsRegister.contentType);
      const body = await metricsRegister.metrics();
      res.status(200).end(body);
      recordObservability('GET', '/metrics', 200, hrtimeMs(started), buffer, true);
    } catch {
      res.status(500).json({ message: 'Metrics unavailable' });
      recordObservability('GET', '/metrics', 500, hrtimeMs(started), buffer, true);
    }
  });

  if (typeof adminToken === 'string' && adminToken.length > 0) {
    app.get('/gateway/admin/logs', (req, res) => {
      const started = process.hrtime.bigint();
      const token = readAdminToken(req);
      if (token !== adminToken) {
        recordObservability(req.method, req.path, 401, hrtimeMs(started), buffer, false);
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      res.status(200).json({ entries: buffer?.getSnapshot() ?? [] });
      recordObservability(req.method, req.path, 200, hrtimeMs(started), buffer, false);
    });

    app.get('/gateway/admin/logs-ui', (req, res) => {
      const started = process.hrtime.bigint();
      const token = readAdminToken(req);
      if (token !== adminToken) {
        recordObservability(req.method, req.path, 401, hrtimeMs(started), buffer, false);
        res.status(401).send('Unauthorized');
        return;
      }
      const entries = buffer?.getSnapshot() ?? [];
      res.status(200).type('html').send(renderAdminLogsHtml(entries));
      recordObservability(req.method, req.path, 200, hrtimeMs(started), buffer, false);
    });
  }

  app.use(express.json());
  app.all('*', async (req: Request, res: Response) => {
    const started = process.hrtime.bigint();
    const inbound = toInboundRequest(req);
    try {
      const result = await options.orchestrator.execute(inbound);
      if (result.kind === 'unauthorized') {
        res.status(401).json({ message: 'Unauthorized' });
        recordObservability(req.method, req.path, 401, hrtimeMs(started), buffer, false);
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ message: 'Not Found' });
        recordObservability(req.method, req.path, 404, hrtimeMs(started), buffer, false);
        return;
      }
      const { statusCode, body, headers } = result.response;
      sendProxied(res, statusCode, body, headers);
      recordObservability(req.method, req.path, statusCode, hrtimeMs(started), buffer, false);
    } catch {
      res.status(502).json({ message: 'Bad Gateway' });
      recordObservability(req.method, req.path, 502, hrtimeMs(started), buffer, false);
    }
  });
  return app;
}
