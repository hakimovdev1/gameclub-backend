import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, ROLE_HIERARCHY } from '../enums/role.enum';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Enforces @Roles() metadata. A user satisfies the requirement if their
 * role, expanded through the privilege hierarchy, includes any required
 * role (e.g. an OWNER passes a route that requires CASHIER).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const user = (req as Request & { user?: AuthenticatedUser }).user;
    if (!user) {
      throw new ForbiddenException('Missing authenticated principal');
    }

    const granted = ROLE_HIERARCHY[user.role] ?? [];
    const allowed = required.some((r) => granted.includes(r));
    if (!allowed) {
      throw new ForbiddenException('Insufficient role for this operation');
    }
    return true;
  }
}
