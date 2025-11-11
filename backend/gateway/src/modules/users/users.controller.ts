import { Controller, Get, Req, ForbiddenException, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestWithUser } from '../../common/auth.middleware.js';
import { getUserRole, listDirectoryUsers } from '../../common/roles.js';
import { User } from '../../entities/user.entity.js';

@Controller()
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Get('admin/users')
  list(@Req() req: RequestWithUser) {
    const email = req.user?.sub;
    const role = getUserRole(email);

    if (role !== 'admin') {
      throw new ForbiddenException('Administrator access required to view the user directory.');
    }

    return { users: listDirectoryUsers() };
  }

  @Get('users/:userId')
  async getUser(@Param('userId') userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
  }
}
