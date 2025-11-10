import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { Product } from '../../entities/product.entity';

import { Category } from '../../entities/category.entity';
import { Option } from '../../entities/option.entity';
import { OptionGroup } from '../../entities/option-group.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Product,

      Category,
      Option,
      OptionGroup,
      User
    ])
  ],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
