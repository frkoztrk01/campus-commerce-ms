import express, { type Express, type Request, type Response } from 'express';
import type { GatewayInboundRequest } from './domain/interfaces';
import type { GatewayProxyOrchestrator } from './application/GatewayProxyOrchestrator';

export interface CreateAppOptions {
  readonly orchestrator: GatewayProxyOrchestrator;
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

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  app.use(express.json());
  app.all('*', async (req: Request, res: Response) => {
    const inbound = toInboundRequest(req);
    const result = await options.orchestrator.execute(inbound);
    if (result.kind === 'unauthorized') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (result.kind === 'not_found') {
      res.status(404).json({ message: 'Not Found' });
      return;
    }
    const { statusCode, body, headers } = result.response;
    sendProxied(res, statusCode, body, headers);
  });
  return app;
}
