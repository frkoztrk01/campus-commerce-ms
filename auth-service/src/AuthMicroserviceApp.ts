import express, { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from './infrastructure/database/UserRepository';

export class AuthMicroserviceApp {
  private readonly app: Express;
  private readonly userRepo: UserRepository;
  private readonly jwtSecret: string;

  constructor(private readonly port: number) {
    this.app = express();
    this.app.use(express.json());
    this.userRepo = new UserRepository();
    // Default secret for dev; should be configured via environment
    this.jwtSecret = process.env.JWT_SECRET || 'kampus-secret';
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok', service: 'auth-service' });
    });

    this.app.post('/api/v1/auth/register', async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
          res.status(400).json({ errors: ['Geçerli bir e-posta adresi giriniz.'] });
          return;
        }
        if (!password || password.length < 6) {
          res.status(400).json({ errors: ['Parola en az 6 karakter olmalıdır.'] });
          return;
        }

        // Check availability
        const existing = await this.userRepo.findByEmail(email);
        if (existing) {
          res.status(400).json({ errors: ['Bu e-posta kullanımda.'] });
          return;
        }

        // Hash & save
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const user = await this.userRepo.createUser(email, passwordHash);

        res.status(201).json({ created: true, userId: user._id });
      } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({ errors: ['Sunucu hatası'] });
      }
    });

    this.app.post('/api/v1/auth/login', async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          res.status(401).json({ message: 'E-posta ve parola gerekli.' });
          return;
        }

        const user = await this.userRepo.findByEmail(email);
        if (!user) {
          res.status(401).json({ message: 'Geçersiz kimlik bilgileri.' });
          return;
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          res.status(401).json({ message: 'Geçersiz kimlik bilgileri.' });
          return;
        }

        const token = jwt.sign(
          { userId: user._id, role: user.role, email: user.email },
          this.jwtSecret,
          { expiresIn: '1d' }
        );

        res.status(200).json({ token });
      } catch (err) {
        console.error('Giriş hatası:', err);
        res.status(500).json({ errors: ['Sunucu hatası'] });
      }
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
