import mongoose from 'mongoose';
import { OrderMicroserviceApp } from './OrderMicroserviceApp';

const port = Number(process.env.PORT) || 4003;
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo-order:27017/order_db';

mongoose.connect(mongoUri)
  .then(() => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
    const application = new OrderMicroserviceApp(port);
    application.listen();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
