import request from 'supertest';
import type { IAccessRepository } from '../domain/interfaces';
import type { IAuthPathPolicy } from '../domain/interfaces';
import type { IHttpClient } from '../domain/interfaces';
import type { IServiceRouteResolver } from '../domain/interfaces';
import type { ProxiedResponse } from '../domain/interfaces';
import { createApp } from '../app';
import { AuthPathPolicy } from '../application/AuthPathPolicy';
import { PrefixServiceRouteResolver } from '../application/PrefixServiceRouteResolver';
import { GatewayProxyOrchestrator } from '../application/GatewayProxyOrchestrator';
import { TrafficLogBuffer } from '../infrastructure/observability/TrafficLogBuffer';

class InMemoryAccessRepository implements IAccessRepository {
  constructor(private readonly validToken: string, private readonly userId: string) {}

  async validateToken(token: string) {
    if (token === this.validToken) {
      return { userId: this.userId };
    }
    return null;
  }
}

function buildObservabilityTestApp(httpClient: IHttpClient, accessRepository: IAccessRepository, adminToken: string) {
  const authPathPolicy: IAuthPathPolicy = new AuthPathPolicy();
  const routeResolver: IServiceRouteResolver = new PrefixServiceRouteResolver({
    authBaseUrl: 'http://auth-service:4001',
    productBaseUrl: 'http://product-service:4002',
    orderBaseUrl: 'http://order-service:4003',
  });
  const orchestrator = new GatewayProxyOrchestrator(
    routeResolver,
    authPathPolicy,
    accessRepository,
    httpClient,
  );
  const trafficLogBuffer = new TrafficLogBuffer(50);
  return {
    app: createApp({
      orchestrator,
      trafficLogBuffer,
      adminLogToken: adminToken,
    }),
    trafficLogBuffer,
  };
}

describe('Dispatcher observability', () => {
  it('exposes Prometheus metrics at /metrics', async () => {
    const httpClient: IHttpClient = {
      forward: jest.fn(async (): Promise<ProxiedResponse> => ({
        statusCode: 200,
        body: '{}',
        headers: {},
      })),
    };
    const { app } = buildObservabilityTestApp(httpClient, new InMemoryAccessRepository('t', 'u'), 'secret');
    const res = await request(app).get('/metrics').expect(200);
    expect(res.headers['content-type']).toMatch(/text/);
    expect(res.text).toContain('dispatcher_http_requests_total');
  });

  it('rejects admin logs without token', async () => {
    const httpClient: IHttpClient = {
      forward: jest.fn(async (): Promise<ProxiedResponse> => ({
        statusCode: 200,
        body: '{}',
        headers: {},
      })),
    };
    const { app } = buildObservabilityTestApp(httpClient, new InMemoryAccessRepository('t', 'u'), 'secret');
    await request(app).get('/gateway/admin/logs').expect(401);
  });

  it('returns log snapshot when admin token is valid', async () => {
    const httpClient: IHttpClient = {
      forward: jest.fn(async (): Promise<ProxiedResponse> => ({
        statusCode: 200,
        body: JSON.stringify({ ok: true }),
        headers: { 'content-type': 'application/json' },
      })),
    };
    const { app } = buildObservabilityTestApp(httpClient, new InMemoryAccessRepository('tok', 'u'), 'adm');
    await request(app)
      .get('/api/v1/products/x')
      .set('Authorization', 'Bearer tok')
      .expect(200);
    const res = await request(app).get('/gateway/admin/logs').set('x-admin-token', 'adm').expect(200);
    expect(Array.isArray(res.body.entries)).toBe(true);
    expect(res.body.entries.length).toBeGreaterThanOrEqual(1);
  });
});
