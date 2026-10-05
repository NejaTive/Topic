import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { buildOpenApiDocument } from './build-openapi-document';

/**
 * Writes apps/api/openapi.json without listening and without DB traffic.
 * PrismaService does not $connect on init (lazy); Config still needs DATABASE_URL in env.
 */
async function exportOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: false,
    abortOnError: false,
  });
  app.setGlobalPrefix('api');

  const document = buildOpenApiDocument(app);
  const outPath = join(__dirname, '..', '..', 'openapi.json');
  writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`);

  await app.close();
  process.exit(0);
}

void exportOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
