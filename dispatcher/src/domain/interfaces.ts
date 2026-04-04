export interface AccessPrincipal {
  readonly userId: string;
}

export interface IAccessRepository {
  validateToken(token: string): Promise<AccessPrincipal | null>;
}

export interface IAuthPathPolicy {
  isPublicPath(path: string): boolean;
}

export interface GatewayInboundRequest {
  readonly method: string;
  readonly path: string;
  readonly query: string;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly rawBody: unknown;
}

export interface ProxiedResponse {
  readonly statusCode: number;
  readonly body: string;
  readonly headers: Record<string, string>;
}

export interface IHttpClient {
  forward(absoluteUrl: string, inbound: GatewayInboundRequest): Promise<ProxiedResponse>;
}

export interface ResolvedRoute {
  readonly baseUrl: string;
}

export interface IServiceRouteResolver {
  resolve(path: string): ResolvedRoute | null;
}

export type GatewayHandleResult =
  | { kind: 'proxied'; response: ProxiedResponse }
  | { kind: 'unauthorized' }
  | { kind: 'not_found' };
