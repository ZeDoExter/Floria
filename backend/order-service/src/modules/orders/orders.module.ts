import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { Order } from '../../entities/order.entity.js';
import { OrderItem } from '../../entities/order-item.entity.js';
import { Product } from '../../entities/product.entity.js';
import { OptionGroup } from '../../entities/option-group.entity.js';
import { Option } from '../../entities/option.entity.js';
import { CartItem } from '../../entities/cart-item.entity.js';
import { Cart } from '../../entities/cart.entity.js';
import { User } from '../../entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, OptionGroup, Option, Cart, CartItem, User])
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
