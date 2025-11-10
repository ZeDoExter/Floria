import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const configService = app.get(ConfigService);

  const corsOrigin = configService.get('CORS_ORIGIN') || 'http://localhost:4173';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    exposedHeaders: ['x-total-count'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-user-role']
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const port = configService.get('PORT') || 3004;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Search service running on port ${port}`);
}

void bootstrap();
