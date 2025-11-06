import { Controller, Get, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service.js';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  searchProducts(@Query('q') query: string) {
    return this.searchService.searchProducts(query);
  }

  @Post('reindex')
  reindex() {
    return this.searchService.reindexProducts();
  }
}
