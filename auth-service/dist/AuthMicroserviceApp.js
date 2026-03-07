"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMicroserviceApp = void 0;
const express_1 = __importDefault(require("express"));
class AuthMicroserviceApp {
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
            res.status(200).json({ status: 'ok', service: 'auth-service' });
        });
        this.app.get('/api/v1/auth/health', (_req, res) => {
            res.status(200).json({ resource: 'auth', version: 'v1' });
        });
        this.app.post('/api/v1/auth/register', (_req, res) => {
            res.status(201).json({ created: true });
        });
        this.app.post('/api/v1/auth/login', (_req, res) => {
            res.status(200).json({ token: 'issued-from-auth-service' });
        });
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`auth-service listening on ${this.port}`);
        });
    }
    getExpressApp() {
        return this.app;
    }
}
exports.AuthMicroserviceApp = AuthMicroserviceApp;
