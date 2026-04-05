import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  products: string[];
  state: 'pending' | 'shipped' | 'delivered' | 'canceled';
  total: number;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: String, required: true },
  products: [{ type: String, required: true }],
  state: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered', 'canceled'],
    default: 'pending' 
  },
  total: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
