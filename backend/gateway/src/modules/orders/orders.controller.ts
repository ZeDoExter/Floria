import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: RequestWithUser) {
    return this.proxy.get('order', '/orders', { user: req.user });
  }

  @Get('customer-orders')
  listCustomerOrders(@Req() req: RequestWithUser) {
    return this.proxy.get('order', '/orders/customer-orders', { user: req.user });
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxy.post('order', '/orders', body, { user: req.user });
  }

  @Patch(':orderId/status')
  updateStatus(@Req() req: RequestWithUser, @Param('orderId') orderId: string, @Body() body: unknown) {
    return this.proxy.patch('order', `/orders/${orderId}/status`, body, { user: req.user });
  }
}
