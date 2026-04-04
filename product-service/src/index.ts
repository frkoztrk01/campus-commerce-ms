import { ProductMicroserviceApp } from './ProductMicroserviceApp';

const port = Number(process.env.PORT) || 4002;
const application = new ProductMicroserviceApp(port);
application.listen();
