import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AddItemDto, MergeCartDto, UpdateItemDto } from './dto/cart-item.dto.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Headers('x-user-id') userId?: string, @Query('anonymousId') anonymousId?: string) {
    return this.cartService.getCart(userId, anonymousId);
  }

  @Post('merge')
  mergeCart(@Headers('x-user-id') userId: string | undefined, @Body() payload: MergeCartDto) {
    return this.cartService.mergeCart(userId, payload);
  }

  @Post('items')
  addItem(
    @Headers('x-user-id') userId: string | undefined,
    @Body() payload: AddItemDto
  ) {
    return this.cartService.addItem(userId, payload.anonymousId, payload);
  }

  @Put('items/:id')
  updateItem(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string | undefined,
    @Body() payload: UpdateItemDto
  ) {
    return this.cartService.updateItem(userId, payload.anonymousId, id, payload);
  }

  @Delete('items/:id')
  removeItem(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string | undefined,
    @Query('anonymousId') anonymousId?: string
  ) {
    return this.cartService.removeItem(userId, anonymousId, id);
  }
}
