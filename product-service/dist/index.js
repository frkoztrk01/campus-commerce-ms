"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProductMicroserviceApp_1 = require("./ProductMicroserviceApp");
const port = Number(process.env.PORT) || 4002;
const application = new ProductMicroserviceApp_1.ProductMicroserviceApp(port);
application.listen();
