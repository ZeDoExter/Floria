import { Body, Controller, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(
    @Headers('x-user-id') userId?: string,
    @Headers('x-user-email') userEmail?: string,
    @Headers('x-user-role') userRole?: string
  ) {
    // Always return user's own orders (orders they placed)
    return this.ordersService.listMyOrders(userId);
  }

  @Get('customer-orders')
  listCustomerOrders(
    @Headers('x-user-id') userId?: string,
    @Headers('x-user-email') userEmail?: string
  ) {
    return this.ordersService.listCustomerOrders(userId, userEmail);
  }

  @Post()
  create(@Headers('x-user-id') userId: string | undefined, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Patch(':orderId/status')
  updateStatus(
    @Headers() headers: Record<string, string>,
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-user-email') userEmail: string | undefined,
    @Headers('x-user-role') userRole: string | undefined,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto
  ) {
    console.log('=== Order Controller Headers ===');
    console.log('All headers:', headers);
    console.log('x-user-id:', userId);
    console.log('x-user-email:', userEmail);
    console.log('x-user-role:', userRole);
    console.log('orderId:', orderId);
    console.log('dto:', dto);
    return this.ordersService.updateOrderStatus(userId, userEmail, userRole, orderId, dto.status);
  }
}
