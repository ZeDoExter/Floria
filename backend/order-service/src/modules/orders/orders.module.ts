import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { Order } from '../../entities/order.entity.js';
import { OrderItem } from '../../entities/order-item.entity.js';
import { Product } from '../../entities/product.entity.js';
import { OptionGroup } from '../../entities/option-group.entity.js';
import { Option } from '../../entities/option.entity.js';
import { User } from '../../entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, OptionGroup, Option, User]),
    HttpModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
