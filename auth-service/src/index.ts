import { AuthMicroserviceApp } from './AuthMicroserviceApp';

const port = Number(process.env.PORT) || 4001;
const application = new AuthMicroserviceApp(port);
application.listen();
