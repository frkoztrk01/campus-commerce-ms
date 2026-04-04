import { connectDispatcherMongo, seedDefaultAccessToken, startHttpServer } from './bootstrap';

async function main(): Promise<void> {
  const port = Number(process.env.PORT) || 3000;
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }
  await connectDispatcherMongo(mongoUri);
  const seedToken = process.env.SEED_ACCESS_TOKEN ?? 'dev-access-token';
  const seedUserId = process.env.SEED_USER_ID ?? 'seed-user';
  await seedDefaultAccessToken(seedToken, seedUserId);
  startHttpServer(port, process.env);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
