import { Controller, Get, Query, Req } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('search')
export class SearchController {
  constructor(private readonly proxy: ProxyService) {}

  @Get('products')
  searchProducts(@Query('q') query: string, @Req() req: RequestWithUser) {
    return this.proxy.get('search', '/search/products', { user: req.user, params: { q: query } });
  }
}
