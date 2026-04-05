import express, { Express, Request, Response } from 'express';
import { OrderRepository } from './infrastructure/database/OrderRepository';

export class OrderMicroserviceApp {
  private readonly app: Express;
  private readonly orderRepo: OrderRepository;

  constructor(private readonly port: number) {
    this.app = express();
    this.app.use(express.json());
    this.orderRepo = new OrderRepository();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok', service: 'order-service' });
    });

    this.app.post('/api/v1/orders', async (req: Request, res: Response): Promise<void> => {
      try {
        const { userId, products, total } = req.body;
        
        if (!userId || !products || !Array.isArray(products) || products.length === 0 || typeof total !== 'number') {
          res.status(400).json({ error: 'Geçersiz sipariş verisi.' });
          return;
        }

        const newOrder = await this.orderRepo.createOrder({ userId, products, total, state: 'pending' });
        res.status(201).json({ created: true, orderId: newOrder._id, state: newOrder.state });
      } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
      }
    });

    this.app.patch('/api/v1/orders/:id/state', async (req: Request, res: Response): Promise<void> => {
      try {
        const { state } = req.body;
        const validStates = ['pending', 'shipped', 'delivered', 'canceled'];
        
        if (!validStates.includes(state)) {
          res.status(400).json({ error: 'Geçersiz sipariş durumu' });
          return;
        }

        const updatedOrder = await this.orderRepo.updateState(req.params.id, state);
        if (updatedOrder) {
          res.status(200).json({ updated: true, state: updatedOrder.state });
        } else {
          res.status(404).json({ error: 'Sipariş bulunamadı' });
        }
      } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
      }
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
