import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from './jwt.service.js';
import { AuthenticatedUser } from '../modules/proxy/proxy.service.js';

export interface RequestHeaders {
  authorization?: string;
  [key: string]: string | string[] | undefined;
}

export interface RequestWithUser {
  headers: RequestHeaders;
  user?: AuthenticatedUser | null;
  [key: string]: unknown;
}

type Next = (error?: Error | unknown) => void;

@Injectable()
export class AuthMiddleware implements NestMiddleware<RequestWithUser, unknown> {
  constructor(private readonly jwtService: JwtService) {}

  use(req: RequestWithUser, _res: unknown, next: Next) {
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
