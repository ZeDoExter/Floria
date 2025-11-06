import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  profile(@Req() req: RequestWithUser) {
    if (!req.user) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: req.user
    };
  }
}
