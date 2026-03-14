import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation.js';
import { PaymentsModule } from './modules/payments/payments.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    PaymentsModule
    // HealthModule will be added later or is not strictly needed for this file, but let's include it if present
  ],
})
export class AppModule { }
