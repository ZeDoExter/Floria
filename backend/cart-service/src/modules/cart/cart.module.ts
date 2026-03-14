import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';

@Module({
  imports: [HttpModule],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule { }
