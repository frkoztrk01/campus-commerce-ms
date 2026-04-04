import type { IServiceRouteResolver, ResolvedRoute } from '../domain/interfaces';

export interface ServiceBaseUrls {
  readonly authBaseUrl: string;
  readonly productBaseUrl: string;
  readonly orderBaseUrl: string;
}

export class PrefixServiceRouteResolver implements IServiceRouteResolver {
  constructor(private readonly bases: ServiceBaseUrls) {}

  resolve(path: string): ResolvedRoute | null {
    const normalized = path.split('?')[0] ?? path;
    if (normalized.startsWith('/api/v1/auth')) {
      return { baseUrl: this.bases.authBaseUrl };
    }
    if (normalized.startsWith('/api/v1/products')) {
      return { baseUrl: this.bases.productBaseUrl };
    }
    if (normalized.startsWith('/api/v1/orders')) {
      return { baseUrl: this.bases.orderBaseUrl };
    }
    return null;
  }
}
