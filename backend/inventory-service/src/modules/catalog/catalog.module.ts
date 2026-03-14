import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service.js';
import { CatalogController } from './catalog.controller.js';
import { Category } from '../../entities/category.entity.js';
import { Product } from '../../entities/product.entity.js';
import { OptionGroup } from '../../entities/option-group.entity.js';
import { Option } from '../../entities/option.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, OptionGroup, Option])
  ],
  providers: [CatalogService],
  controllers: [CatalogController]
})
export class CatalogModule {}
