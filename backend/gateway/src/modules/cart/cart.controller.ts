import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('cart')
export class CartController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  getCart(@Req() req: RequestWithUser, @Query('anonymousId') anonymousId?: string) {
    return this.proxy.get('cart', '/cart', { user: req.user, params: anonymousId ? { anonymousId } : undefined });
  }

  @Post('merge')
  merge(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxy.post('cart', '/cart/merge', body, { user: req.user });
  }

  @Post('items')
  addItem(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxy.post('cart', '/cart/items', body, { user: req.user });
  }

  @Put('items/:id')
  updateItem(@Param('id') id: string, @Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxy.put('cart', `/cart/items/${id}`, body, { user: req.user });
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proxy.delete('cart', `/cart/items/${id}`, { user: req.user });
  }
}
