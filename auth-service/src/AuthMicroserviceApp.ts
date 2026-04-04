import express, { Express } from 'express';

export class AuthMicroserviceApp {
  private readonly app: Express;

  constructor(private readonly port: number) {
    this.app = express();
    this.app.use(express.json());
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok', service: 'auth-service' });
    });
    this.app.get('/api/v1/auth/health', (_req, res) => {
      res.status(200).json({ resource: 'auth', version: 'v1' });
    });
    this.app.post('/api/v1/auth/register', (_req, res) => {
      res.status(201).json({ created: true });
    });
    this.app.post('/api/v1/auth/login', (_req, res) => {
      res.status(200).json({ token: 'issued-from-auth-service' });
    });
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`auth-service listening on ${this.port}`);
    });
  }

  getExpressApp(): Express {
    return this.app;
  }
}
