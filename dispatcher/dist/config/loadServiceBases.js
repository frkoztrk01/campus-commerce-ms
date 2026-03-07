"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadServiceBasesFromEnv = loadServiceBasesFromEnv;
function loadServiceBasesFromEnv(env) {
    const authBaseUrl = env.AUTH_SERVICE_URL;
    const productBaseUrl = env.PRODUCT_SERVICE_URL;
    const orderBaseUrl = env.ORDER_SERVICE_URL;
    if (!authBaseUrl || !productBaseUrl || !orderBaseUrl) {
        throw new Error('AUTH_SERVICE_URL, PRODUCT_SERVICE_URL, and ORDER_SERVICE_URL must be set');
    }
    return {
        authBaseUrl,
        productBaseUrl,
        orderBaseUrl,
    };
}
