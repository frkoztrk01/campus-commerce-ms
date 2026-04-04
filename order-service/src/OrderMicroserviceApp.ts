import express, { Express } from 'express';

export class OrderMicroserviceApp {
  private readonly app: Express;

  constructor(private readonly port: number) {
    this.app = express();
    this.app.use(express.json());
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok', service: 'order-service' });
    });
    this.app.get('/api/v1/orders/health', (_req, res) => {
      res.status(200).json({ resource: 'orders', version: 'v1' });
    });
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`order-service listening on ${this.port}`);
    });
  }

  getExpressApp(): Express {
    return this.app;
  }
}
