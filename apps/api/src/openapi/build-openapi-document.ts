import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

function apiPackageVersion(): string {
  const pkgPath = join(__dirname, '..', '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
  return pkg.version;
}

/** Shared OpenAPI document for runtime Swagger and openapi:export. */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Topic API')
    .setVersion(apiPackageVersion())
    .build();

  return SwaggerModule.createDocument(app, config);
}

/** Mount Swagger UI at /api/docs and JSON at /api/openapi.json. */
export function setupOpenApi(app: INestApplication): void {
  const document = buildOpenApiDocument(app);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'openapi.json',
  });
}
