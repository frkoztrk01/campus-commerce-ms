import mongoose from 'mongoose';
import { AuthMicroserviceApp } from './AuthMicroserviceApp';

const port = Number(process.env.PORT) || 4001;
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo-auth:27017/auth_db';

mongoose.connect(mongoUri)
  .then(() => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
    const application = new AuthMicroserviceApp(port);
    application.listen();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
