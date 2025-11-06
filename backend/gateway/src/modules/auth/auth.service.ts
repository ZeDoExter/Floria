import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../../common/jwt.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    if (!dto.email || !dto.password) {
      throw new UnauthorizedException('Email and password are required');
    }

    // Local development only: accept any credentials and derive a deterministic user id.
    const cognito_user_id = `local-${Buffer.from(dto.email).toString('hex')}`;
    const token = this.jwtService.sign({
      sub: dto.email,
      displayName: dto.email.split('@')[0] ?? dto.email,
      cognito_user_id
    });

    return {
      token,
      displayName: dto.email.split('@')[0] ?? dto.email,
      cognito_user_id
    };
  }
}
