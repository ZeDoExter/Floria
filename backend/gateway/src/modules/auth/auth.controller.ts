import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('auth/register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName
    );
    
    // Auto login after registration
    return this.authService.login({ email: dto.email, password: dto.password });
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
