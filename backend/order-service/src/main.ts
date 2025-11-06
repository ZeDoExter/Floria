import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({ origin: configService.get('CORS_ORIGIN') || '*', credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );
  const port = configService.get('PORT') || 3003;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Order service running on port ${port}`);
}

void bootstrap();
