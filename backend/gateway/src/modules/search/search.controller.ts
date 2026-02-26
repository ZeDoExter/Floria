import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from '../products/catalog.service.js';

@Controller('search')
export class SearchController {
  constructor(private readonly catalog: CatalogService) { }

  @Get('products')
  searchProducts(@Query('q') query: string) {
    return this.catalog.searchProducts(query || '');
  }
}
