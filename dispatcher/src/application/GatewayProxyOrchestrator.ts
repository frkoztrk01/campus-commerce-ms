import type {
  GatewayHandleResult,
  GatewayInboundRequest,
  IAccessRepository,
  IAuthPathPolicy,
  IHttpClient,
  IServiceRouteResolver,
} from '../domain/interfaces';

export class GatewayProxyOrchestrator {
  constructor(
    private readonly routeResolver: IServiceRouteResolver,
    private readonly authPathPolicy: IAuthPathPolicy,
    private readonly accessRepository: IAccessRepository,
    private readonly httpClient: IHttpClient,
  ) {}

  async execute(inbound: GatewayInboundRequest): Promise<GatewayHandleResult> {
    const route = this.routeResolver.resolve(inbound.path);
    if (!route) {
      return { kind: 'not_found' };
    }

    if (this.authPathPolicy.isPublicPath(inbound.path)) {
      const url = this.buildAbsoluteUrl(route.baseUrl, inbound);
      const response = await this.httpClient.forward(url, inbound);
      return { kind: 'proxied', response };
    }

    const authorization = inbound.headers.authorization;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
      return { kind: 'unauthorized' };
    }
    const token = authorization.slice('Bearer '.length).trim();
    const principal = await this.accessRepository.validateToken(token);
    if (!principal) {
      return { kind: 'unauthorized' };
    }

    const url = this.buildAbsoluteUrl(route.baseUrl, inbound);
    const response = await this.httpClient.forward(url, inbound);
    return { kind: 'proxied', response };
  }

  private buildAbsoluteUrl(baseUrl: string, inbound: GatewayInboundRequest): string {
    const base = baseUrl.replace(/\/$/, '');
    return `${base}${inbound.path}${inbound.query}`;
  }
}
