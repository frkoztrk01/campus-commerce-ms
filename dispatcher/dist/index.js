"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap_1 = require("./bootstrap");
async function main() {
    const port = Number(process.env.PORT) || 3000;
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is required');
    }
    await (0, bootstrap_1.connectDispatcherMongo)(mongoUri);
    const seedToken = process.env.SEED_ACCESS_TOKEN ?? 'dev-access-token';
    const seedUserId = process.env.SEED_USER_ID ?? 'seed-user';
    await (0, bootstrap_1.seedDefaultAccessToken)(seedToken, seedUserId);
    (0, bootstrap_1.startHttpServer)(port, process.env);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
