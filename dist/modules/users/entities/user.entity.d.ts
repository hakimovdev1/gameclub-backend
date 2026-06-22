import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from '../../../common/enums/role.enum';
export declare class User extends BaseEntity {
    email: string;
    fullName: string;
    passwordHash: string;
    role: Role;
    isActive: boolean;
    lastLoginAt: Date | null;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
}
