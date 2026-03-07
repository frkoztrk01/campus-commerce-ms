"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefixServiceRouteResolver = void 0;
class PrefixServiceRouteResolver {
    bases;
    constructor(bases) {
        this.bases = bases;
    }
    resolve(path) {
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
exports.PrefixServiceRouteResolver = PrefixServiceRouteResolver;
