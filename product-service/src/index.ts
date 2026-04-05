import mongoose from 'mongoose';
import { ProductMicroserviceApp } from './ProductMicroserviceApp';

const port = Number(process.env.PORT) || 4002;
const mongoUri = process.env.MONGO_URI || 'mongodb://product-db:27017/product_db';

mongoose.connect(mongoUri)
  .then(() => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
    const application = new ProductMicroserviceApp(port);
    application.listen();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
