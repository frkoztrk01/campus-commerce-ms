"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayProxyOrchestrator = void 0;
class GatewayProxyOrchestrator {
    routeResolver;
    authPathPolicy;
    accessRepository;
    httpClient;
    constructor(routeResolver, authPathPolicy, accessRepository, httpClient) {
        this.routeResolver = routeResolver;
        this.authPathPolicy = authPathPolicy;
        this.accessRepository = accessRepository;
        this.httpClient = httpClient;
    }
    async execute(inbound) {
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
    buildAbsoluteUrl(baseUrl, inbound) {
        const base = baseUrl.replace(/\/$/, '');
        return `${base}${inbound.path}${inbound.query}`;
    }
}
exports.GatewayProxyOrchestrator = GatewayProxyOrchestrator;
