import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
  });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security & transport hardening.
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string[]>('app.corsOrigins'),
    credentials: true,
  });

  // Versioned, prefixed REST surface: /api/v1/...
  app.setGlobalPrefix(config.get<string>('app.apiPrefix') ?? 'api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.get<string>('app.defaultVersion') ?? '1',
  });

  // Strict DTO validation everywhere; unknown properties are rejected.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableShutdownHooks();

  // OpenAPI / Swagger.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Game Club Management API')
    .setDescription(
      'Computer control and deterministic, integer-based money handling ' +
        'for a game club: rooms, computers, sessions, customers, debt ' +
        'ledger, analytics and audit.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('app.port') ?? 4040;
  await app.listen(port);
  logger.log(`API ready on http://localhost:${port}/api/v1`);
  logger.log(`Swagger docs on http://localhost:${port}/docs`);
}

void bootstrap();
