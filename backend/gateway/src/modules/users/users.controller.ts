import { Controller, Get, Req, ForbiddenException } from '@nestjs/common';
import { RequestWithUser } from '../../common/auth.middleware.js';
import { getUserRole, listDirectoryUsers } from '../../common/roles.js';

@Controller('admin/users')
export class UsersController {
  @Get()
  list(@Req() req: RequestWithUser) {
    const email = req.user?.sub;
    const role = getUserRole(email);

    if (role !== 'admin') {
      throw new ForbiddenException('Administrator access required to view the user directory.');
    }

    return { users: listDirectoryUsers() };
  }
}
