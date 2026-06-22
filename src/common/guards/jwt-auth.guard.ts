import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

export const ACCESS_TOKEN_COOKIE = 'access_token';

/**
 * Verifies the access JWT on every request except those marked @Public.
 * Accepts the token from a `Bearer` header or the HTTP-only access cookie
 * so both API clients and the browser SPA are supported.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const payload = await this.jwt.verifyAsync<AuthenticatedUser>(token, {
        secret: this.config.get<string>('auth.accessSecret'),
      });
      (req as Request & { user: AuthenticatedUser }).user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractToken(req: Request): string | undefined {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }
    const cookies = (req as unknown as { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[ACCESS_TOKEN_COOKIE];
  }
}
