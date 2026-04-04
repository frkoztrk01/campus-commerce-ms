import type { IAuthPathPolicy } from '../domain/interfaces';

export class AuthPathPolicy implements IAuthPathPolicy {
  isPublicPath(path: string): boolean {
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
