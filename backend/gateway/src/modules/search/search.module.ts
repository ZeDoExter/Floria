import { Module } from '@nestjs/common';
import { SearchController } from './search.controller.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [ProductsModule],
  controllers: [SearchController]
})
export class SearchModule { }
