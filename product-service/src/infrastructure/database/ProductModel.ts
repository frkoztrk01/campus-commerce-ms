import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  stock: number;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
