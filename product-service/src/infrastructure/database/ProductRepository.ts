import { ProductModel, IProduct } from './ProductModel';

export class ProductRepository {
  async findAll(): Promise<IProduct[]> {
    return ProductModel.find().exec();
  }

  async findById(id: string): Promise<IProduct | null> {
    return ProductModel.findById(id).exec();
  }

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = new ProductModel(data);
    return product.save();
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
