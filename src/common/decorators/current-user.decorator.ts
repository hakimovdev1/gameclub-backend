import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../enums/role.enum';

/** Authenticated principal attached to the request by the JWT guard. */
export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
