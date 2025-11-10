import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { Account } from '../../entities/account.entity.js';
import { User } from '../../entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, User])
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
