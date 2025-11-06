import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { AuthMiddleware } from './common/auth.middleware.js';
import { ProxyModule } from './modules/proxy/proxy.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 5000 }),
    ProxyModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    SearchModule
  ],
  providers: [AuthMiddleware]
})
export class AppModule {}
