import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './env.validation.js';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { AuthMiddleware } from './common/auth.middleware.js';
import { ProxyModule } from './modules/proxy/proxy.module.js';
import { Account } from './entities/account.entity.js';
import { User } from './entities/user.entity.js';
import { HealthModule } from 'floria-shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Account, User],
      synchronize: true,
      logging: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'flora-tailor-dev-secret'),
        signOptions: { expiresIn: '7d' }
      }),
      inject: [ConfigService],
      global: true
    }),
    HttpModule.register({ timeout: 5000 }),
    ProxyModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    SearchModule,
    UsersModule,
    PaymentModule,
    HealthModule
  ],
  providers: [AuthMiddleware]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
