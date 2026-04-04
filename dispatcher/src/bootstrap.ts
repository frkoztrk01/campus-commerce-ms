import mongoose from 'mongoose';
import { AuthPathPolicy } from './application/AuthPathPolicy';
import { PrefixServiceRouteResolver } from './application/PrefixServiceRouteResolver';
import { GatewayProxyOrchestrator } from './application/GatewayProxyOrchestrator';
import { FetchHttpClient } from './infrastructure/http/FetchHttpClient';
import { AccessTokenModel } from './infrastructure/persistence/accessToken.model';
import { MongoAccessRepository } from './infrastructure/persistence/MongoAccessRepository';
import { createApp } from './app';
import { loadServiceBasesFromEnv } from './config/loadServiceBases';

export async function seedDefaultAccessToken(seedToken: string, userId: string): Promise<void> {
  await AccessTokenModel.updateOne(
    { token: seedToken },
    { $set: { userId } },
    { upsert: true },
  ).exec();
}

export async function connectDispatcherMongo(uri: string): Promise<void> {
  await mongoose.connect(uri);
}

export function buildProductionOrchestrator(env: NodeJS.ProcessEnv): GatewayProxyOrchestrator {
  const bases = loadServiceBasesFromEnv(env);
  const routeResolver = new PrefixServiceRouteResolver(bases);
  const authPathPolicy = new AuthPathPolicy();
  const accessRepository = new MongoAccessRepository(AccessTokenModel);
  const httpClient = new FetchHttpClient();
  return new GatewayProxyOrchestrator(routeResolver, authPathPolicy, accessRepository, httpClient);
}

export function startHttpServer(port: number, env: NodeJS.ProcessEnv): void {
  const orchestrator = buildProductionOrchestrator(env);
  const app = createApp({ orchestrator });
  app.listen(port, () => {
    console.log(`dispatcher listening on ${port}`);
  });
}
