import express, { Express, Request, Response } from 'express';
import { ProductRepository } from './infrastructure/database/ProductRepository';

export class ProductMicroserviceApp {
  private readonly app: Express;
  private readonly productRepo: ProductRepository;

  constructor(private readonly port: number) {
    this.app = express();
    this.app.use(express.json());
    this.productRepo = new ProductRepository();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok', service: 'product-service' });
    });

    // List all products
    this.app.get('/api/v1/products', async (_req: Request, res: Response): Promise<void> => {
      try {
        const products = await this.productRepo.findAll();
        res.status(200).json(products);
      } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
      }
    });

    // Create a new product
    this.app.post('/api/v1/products', async (req: Request, res: Response): Promise<void> => {
      try {
        const { name, price, stock } = req.body;
        
        if (!name) {
          res.status(400).json({ error: 'Ürün adı gereklidir.' });
          return;
        }

        const newProduct = await this.productRepo.createProduct({ name, price, stock });
        res.status(201).json({ created: true, productId: newProduct._id });
      } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
      }
    });

    // Delete a product
    this.app.delete('/api/v1/products/:id', async (req: Request, res: Response): Promise<void> => {
      try {
        const success = await this.productRepo.deleteProduct(req.params.id);
        if (success) {
          res.status(200).json({ deleted: true });
        } else {
          res.status(404).json({ error: 'Ürün bulunamadı' });
        }
      } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
      }
    });
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`product-service listening on ${this.port}`);
    });
  }

  getExpressApp(): Express {
    return this.app;
  }
}
