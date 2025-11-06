import { Body, Controller, Get, Param, Post, Put, Delete, Req, Query } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: RequestWithUser, @Query() query: Record<string, string>) {
    return this.proxy.get('product', '/products', { user: req.user, params: query });
  }

  @Get(':id')
  detail(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proxy.get('product', `/products/${id}`, { user: req.user });
  }

  @Post()
  create(@Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.post('product', '/products', body, { user: req.user });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.put('product', `/products/${id}`, body, { user: req.user });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proxy.delete('product', `/products/${id}`, { user: req.user });
  }
}
