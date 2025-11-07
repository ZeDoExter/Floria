import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { CategoriesController } from './categories.controller.js';
import { OptionGroupsController } from './option-groups.controller.js';
import { OptionsController } from './options.controller.js';

@Module({
  controllers: [ProductsController, CategoriesController, OptionGroupsController, OptionsController]
})
export class ProductsModule {}
