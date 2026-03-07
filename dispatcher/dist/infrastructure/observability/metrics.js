"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestDurationSeconds = exports.httpRequestsTotal = exports.metricsRegister = void 0;
exports.routeGroupFromPath = routeGroupFromPath;
const prom_client_1 = require("prom-client");
exports.metricsRegister = new prom_client_1.Registry();
exports.httpRequestsTotal = new prom_client_1.Counter({
    name: 'dispatcher_http_requests_total',
    help: 'Total HTTP requests handled by the dispatcher',
    labelNames: ['method', 'route_group', 'status_code'],
    registers: [exports.metricsRegister],
});
exports.httpRequestDurationSeconds = new prom_client_1.Histogram({
    name: 'dispatcher_http_request_duration_seconds',
    help: 'Duration of dispatcher request handling in seconds',
    labelNames: ['method', 'route_group'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [exports.metricsRegister],
});
function routeGroupFromPath(path) {
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
