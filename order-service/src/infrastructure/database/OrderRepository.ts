import { OrderModel, IOrder } from './OrderModel';

export class OrderRepository {
  async createOrder(data: Partial<IOrder>): Promise<IOrder> {
    const order = new OrderModel(data);
    return order.save();
  }

  async findById(id: string): Promise<IOrder | null> {
    return OrderModel.findById(id).exec();
  }

  async updateState(id: string, state: string): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(id, { state }, { new: true }).exec();
  }
}
