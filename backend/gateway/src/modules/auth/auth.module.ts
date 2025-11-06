import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtService } from '../../common/jwt.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [JwtService]
})
export class AuthModule {}
