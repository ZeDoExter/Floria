import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from './jwt.service.js';
import { AuthenticatedUser } from '../modules/proxy/proxy.service.js';

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser | null;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: RequestWithUser, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.slice('Bearer '.length);
      try {
        const payload = this.jwtService.verify(token);
        req.user = {
          sub: payload.sub,
          displayName: payload.displayName,
          cognito_user_id: payload.cognito_user_id
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Invalid JWT provided', error);
      }
    }

    next();
  }
}
