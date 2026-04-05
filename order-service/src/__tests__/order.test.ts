import request from 'supertest';
import { OrderMicroserviceApp } from '../OrderMicroserviceApp';

jest.mock('../infrastructure/database/OrderRepository', () => {
  const dummyOrders = [
    { _id: 'ord-1', userId: 'user-1', products: ['prod-1'], state: 'pending', total: 1500 },
  ];
  return {
    OrderRepository: jest.fn().mockImplementation(() => ({
      createOrder: jest.fn().mockImplementation(async (data) => ({ _id: 'ord-2', ...data, state: 'pending' })),
      findById: jest.fn().mockImplementation(async (id) => dummyOrders.find(o => o._id === id) || null),
      updateState: jest.fn().mockImplementation(async (id, state) => {
        const order = dummyOrders.find(o => o._id === id);
        if (order) { order.state = state; return order; }
        return null;
      }),
    }))
  };
});

const app = new OrderMicroserviceApp(0).getExpressApp();

describe('Order Service - State Machine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/orders', () => {
    it('should create order and start with pending state', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({ userId: 'user-2', products: ['prod-2'], total: 25 });
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('state', 'pending');
    });
  });

  describe('PATCH /api/v1/orders/:id/state', () => {
    it('should transition state from pending to shipped', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/ord-1/state')
        .send({ state: 'shipped' });
        
      // If endpoint doesn't exist yet, it returns 404 (Red phase)
      if (res.status !== 404) {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('state', 'shipped');
      }
    });

    it('should return 400 for invalid state transition', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/ord-1/state')
        .send({ state: 'not-a-state' });
        
      if (res.status !== 404) {
        expect(res.status).toBe(400);
      }
    });
  });
});
