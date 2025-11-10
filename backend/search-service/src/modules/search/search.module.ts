import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';
import { Product } from '../../entities/product.entity.js';
import { Category } from '../../entities/category.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category])
  ],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
