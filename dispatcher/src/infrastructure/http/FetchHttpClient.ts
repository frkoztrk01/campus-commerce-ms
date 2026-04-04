import type { GatewayInboundRequest, IHttpClient, ProxiedResponse } from '../../domain/interfaces';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

export class FetchHttpClient implements IHttpClient {
  async forward(absoluteUrl: string, inbound: GatewayInboundRequest): Promise<ProxiedResponse> {
    const headers = new Headers();
    for (const [key, value] of Object.entries(inbound.headers)) {
      if (value === undefined) {
        continue;
      }
      const lower = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.has(lower)) {
        continue;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }

    let requestBody: string | undefined;
    if (inbound.method !== 'GET' && inbound.method !== 'HEAD') {
      if (typeof inbound.rawBody === 'string') {
        requestBody = inbound.rawBody;
      } else if (inbound.rawBody !== undefined && inbound.rawBody !== null) {
        requestBody = JSON.stringify(inbound.rawBody);
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json');
        }
      }
    }

    const response = await fetch(absoluteUrl, {
      method: inbound.method,
      headers,
      body: requestBody,
    });
    const responseText = await response.text();
    const outHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      outHeaders[k] = v;
    });
    return {
      statusCode: response.status,
      body: responseText,
      headers: outHeaders,
    };
  }
}
