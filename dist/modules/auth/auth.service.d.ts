import { UsersService } from '../users/users.service';
import { PasswordService } from './services/password.service';
import { TokenService, IssuedTokens } from './services/token.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/entities/user.entity';
interface RequestContext {
    userAgent?: string | null;
    ipAddress?: string | null;
    requestId?: string | null;
}
export declare class AuthService {
    private readonly users;
    private readonly passwords;
    private readonly tokens;
    private readonly audit;
    constructor(users: UsersService, passwords: PasswordService, tokens: TokenService, audit: AuditService);
    login(dto: LoginDto, ctx: RequestContext): Promise<IssuedTokens>;
    refresh(presented: string, ctx: RequestContext): Promise<IssuedTokens>;
    logout(presented?: string): Promise<void>;
    changePassword(userId: string, dto: ChangePasswordDto, ctx: RequestContext): Promise<void>;
    getProfile(userId: string): Promise<User>;
    private registerFailure;
    private claimsFromRefresh;
    private resolveUserIdFromRefresh;
    private toClaims;
}
export {};
