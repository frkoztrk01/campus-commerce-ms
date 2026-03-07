"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OrderMicroserviceApp_1 = require("./OrderMicroserviceApp");
const port = Number(process.env.PORT) || 4003;
const application = new OrderMicroserviceApp_1.OrderMicroserviceApp(port);
application.listen();
