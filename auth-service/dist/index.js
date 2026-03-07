"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthMicroserviceApp_1 = require("./AuthMicroserviceApp");
const port = Number(process.env.PORT) || 4001;
const application = new AuthMicroserviceApp_1.AuthMicroserviceApp(port);
application.listen();
