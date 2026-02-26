import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller.js';
import { CategoriesController } from './categories.controller.js';
import { OptionGroupsController } from './option-groups.controller.js';
import { OptionsController } from './options.controller.js';
import { CatalogService } from './catalog.service.js';
import { Category } from '../../entities/category.entity.js';
import { Product } from '../../entities/product.entity.js';
import { OptionGroup } from '../../entities/option-group.entity.js';
import { Option } from '../../entities/option.entity.js';
import { CategoryOwnerGuard } from '../../common/guards/category-owner.guard.js';
import { ProductOwnerGuard } from '../../common/guards/product-owner.guard.js';
import { OptionGroupOwnerGuard } from '../../common/guards/option-group-owner.guard.js';
import { OptionOwnerGuard } from '../../common/guards/option-owner.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, OptionGroup, Option])
  ],
  controllers: [ProductsController, CategoriesController, OptionGroupsController, OptionsController],
  providers: [CatalogService, CategoryOwnerGuard, ProductOwnerGuard, OptionGroupOwnerGuard, OptionOwnerGuard],
  exports: [CatalogService]
})
export class ProductsModule { }
