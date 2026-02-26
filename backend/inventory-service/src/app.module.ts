import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { Category } from './entities/category.entity.js';
import { Product } from './entities/product.entity.js';
import { OptionGroup } from './entities/option-group.entity.js';
import { Option } from './entities/option.entity.js';
import { HealthModule } from 'floria-shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      username: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD ?? 'postgres',
      database: process.env.POSTGRES_DB ?? 'appdb',
      entities: [Category, Product, OptionGroup, Option],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
    CatalogModule,
    HealthModule
  ]
})
export class AppModule { }
