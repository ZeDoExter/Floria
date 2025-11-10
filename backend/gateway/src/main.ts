import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || '*',
    credentials: true,
    exposedHeaders: ['x-total-count']
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Gateway running on port ${port}`);
}

void bootstrap();
