import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  displayName: string;
  cognito_user_id: string;
}

@Injectable()
export class JwtService {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret = configService.get<string>('JWT_SECRET', 'flora-tailor-dev-secret');
  }

  sign(payload: JwtPayload) {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
