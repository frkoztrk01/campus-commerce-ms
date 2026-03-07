"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthPathPolicy = void 0;
class AuthPathPolicy {
    isPublicPath(path) {
        const normalized = path.split('?')[0] ?? path;
        if (normalized === '/api/v1/auth/register' || normalized.startsWith('/api/v1/auth/register/')) {
            return true;
        }
        if (normalized === '/api/v1/auth/login' || normalized.startsWith('/api/v1/auth/login/')) {
            return true;
        }
        return false;
    }
}
exports.AuthPathPolicy = AuthPathPolicy;
