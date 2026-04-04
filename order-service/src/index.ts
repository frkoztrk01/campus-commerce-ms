import { OrderMicroserviceApp } from './OrderMicroserviceApp';

const port = Number(process.env.PORT) || 4003;
const application = new OrderMicroserviceApp(port);
application.listen();
