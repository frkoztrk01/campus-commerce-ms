"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductMicroserviceApp = void 0;
const express_1 = __importDefault(require("express"));
class ProductMicroserviceApp {
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
            res.status(200).json({ status: 'ok', service: 'product-service' });
        });
        this.app.get('/api/v1/products/health', (_req, res) => {
            res.status(200).json({ resource: 'products', version: 'v1' });
        });
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`product-service listening on ${this.port}`);
        });
    }
    getExpressApp() {
        return this.app;
    }
}
exports.ProductMicroserviceApp = ProductMicroserviceApp;
