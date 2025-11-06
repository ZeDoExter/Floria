import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Headers('x-user-id') userId?: string) {
    return this.ordersService.listOrders(userId);
  }

  @Post()
  create(@Headers('x-user-id') userId: string | undefined, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }
}
