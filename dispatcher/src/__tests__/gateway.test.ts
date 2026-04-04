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

class InMemoryAccessRepository implements IAccessRepository {
  constructor(private readonly validToken: string, private readonly userId: string) {}

  async validateToken(token: string) {
    if (token === this.validToken) {
      return { userId: this.userId };
    }
    return null;
  }
}

function buildTestApp(httpClient: IHttpClient, accessRepository: IAccessRepository) {
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
  return createApp({ orchestrator });
}

describe('Dispatcher gateway', () => {
  it('rejects protected routes without Authorization with 401', async () => {
    const httpClient: IHttpClient = {
      forward: jest.fn(async (): Promise<ProxiedResponse> => ({
        statusCode: 200,
        body: '{}',
        headers: {},
      })),
    };
    const app = buildTestApp(httpClient, new InMemoryAccessRepository('valid-token', 'user-1'));
    await request(app).get('/api/v1/products/health').expect(401);
    expect(httpClient.forward).not.toHaveBeenCalled();
  });

  it('proxies to the resolved service when Bearer token is valid', async () => {
    const forwarded: string[] = [];
    const httpClient: IHttpClient = {
      forward: jest.fn(async (absoluteUrl: string): Promise<ProxiedResponse> => {
        forwarded.push(absoluteUrl);
        return {
          statusCode: 200,
          body: JSON.stringify({ resource: 'products' }),
          headers: { 'content-type': 'application/json' },
        };
      }),
    };
    const app = buildTestApp(httpClient, new InMemoryAccessRepository('valid-token', 'user-1'));
    const res = await request(app)
      .get('/api/v1/products/health')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
    expect(res.body).toEqual({ resource: 'products' });
    expect(httpClient.forward).toHaveBeenCalledTimes(1);
    expect(forwarded[0]).toBe('http://product-service:4002/api/v1/products/health');
  });

  it('allows public auth routes without token and forwards the request', async () => {
    const httpClient: IHttpClient = {
      forward: jest.fn(async (): Promise<ProxiedResponse> => ({
        statusCode: 201,
        body: JSON.stringify({ created: true }),
        headers: { 'content-type': 'application/json' },
      })),
    };
    const app = buildTestApp(httpClient, new InMemoryAccessRepository('valid-token', 'user-1'));
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@b.com', password: 'x' })
      .expect(201);
    expect(res.body).toEqual({ created: true });
    expect(httpClient.forward).toHaveBeenCalledTimes(1);
    const call = (httpClient.forward as jest.Mock).mock.calls[0];
    expect(call[0]).toBe('http://auth-service:4001/api/v1/auth/register');
  });
});
