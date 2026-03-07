"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderMicroserviceApp = void 0;
const express_1 = __importDefault(require("express"));
class OrderMicroserviceApp {
    port;
    app;
    constructor(port) {
        this.port = port;
        this.app = (0, express_1.default)();
        this.app.use(express_1.default.json());
        this.registerRoutes();
    }
    registerRoutes() {
        this.app.get('/health', (_req, res) => {
            res.status(200).json({ status: 'ok', service: 'order-service' });
        });
        this.app.get('/api/v1/orders/health', (_req, res) => {
            res.status(200).json({ resource: 'orders', version: 'v1' });
        });
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`order-service listening on ${this.port}`);
        });
    }
    getExpressApp() {
        return this.app;
    }
}
exports.OrderMicroserviceApp = OrderMicroserviceApp;
