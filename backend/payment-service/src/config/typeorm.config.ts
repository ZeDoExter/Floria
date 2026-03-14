// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // โหลด .env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('POSTGRES_HOST', 'localhost'),
        port: parseInt(cfg.get('POSTGRES_PORT', '5432'), 10),
        username: cfg.get('POSTGRES_USER'),
        password: cfg.get('POSTGRES_PASSWORD'),
        database: cfg.get('POSTGRES_DB'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        migrationsRun: true,
        logging: cfg.get('NODE_ENV') !== 'production',
        // กันเผื่อ DB ยังไม่ขึ้น
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
  ],
})
export class AppModule {}
