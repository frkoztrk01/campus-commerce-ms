"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDefaultAccessToken = seedDefaultAccessToken;
exports.connectDispatcherMongo = connectDispatcherMongo;
exports.buildProductionOrchestrator = buildProductionOrchestrator;
exports.startHttpServer = startHttpServer;
const mongoose_1 = __importDefault(require("mongoose"));
const AuthPathPolicy_1 = require("./application/AuthPathPolicy");
const PrefixServiceRouteResolver_1 = require("./application/PrefixServiceRouteResolver");
const GatewayProxyOrchestrator_1 = require("./application/GatewayProxyOrchestrator");
const FetchHttpClient_1 = require("./infrastructure/http/FetchHttpClient");
const accessToken_model_1 = require("./infrastructure/persistence/accessToken.model");
const MongoAccessRepository_1 = require("./infrastructure/persistence/MongoAccessRepository");
const app_1 = require("./app");
const loadServiceBases_1 = require("./config/loadServiceBases");
const TrafficLogBuffer_1 = require("./infrastructure/observability/TrafficLogBuffer");
async function seedDefaultAccessToken(seedToken, userId) {
    await accessToken_model_1.AccessTokenModel.updateOne({ token: seedToken }, { $set: { userId } }, { upsert: true }).exec();
}
async function connectDispatcherMongo(uri) {
    await mongoose_1.default.connect(uri);
}
function buildProductionOrchestrator(env) {
    const bases = (0, loadServiceBases_1.loadServiceBasesFromEnv)(env);
    const routeResolver = new PrefixServiceRouteResolver_1.PrefixServiceRouteResolver(bases);
    const authPathPolicy = new AuthPathPolicy_1.AuthPathPolicy();
    const accessRepository = new MongoAccessRepository_1.MongoAccessRepository(accessToken_model_1.AccessTokenModel);
    const httpClient = new FetchHttpClient_1.FetchHttpClient();
    return new GatewayProxyOrchestrator_1.GatewayProxyOrchestrator(routeResolver, authPathPolicy, accessRepository, httpClient);
}
function startHttpServer(port, env) {
    const orchestrator = buildProductionOrchestrator(env);
    const trafficLogBuffer = new TrafficLogBuffer_1.TrafficLogBuffer(500);
    const adminLogToken = env.ADMIN_LOG_TOKEN ?? 'dev-admin-token';
    const app = (0, app_1.createApp)({
        orchestrator,
        trafficLogBuffer,
        adminLogToken,
    });
    app.listen(port, () => {
        console.log(`dispatcher listening on ${port}`);
    });
}
