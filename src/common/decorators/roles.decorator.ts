import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/** Restrict a route/controller to one or more roles (inclusive of higher roles). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
