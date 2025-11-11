import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller.js';
import { User } from '../../entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController]
})
export class UsersModule {}
