import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Role } from '../../../common/enums/role.enum';
export interface AccessTokenClaims {
    sub: string;
    email: string;
    role: Role;
}
export interface IssuedTokens {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: Date;
}
interface RequestContext {
    userAgent?: string | null;
    ipAddress?: string | null;
}
export declare class TokenService {
    private readonly jwt;
    private readonly config;
    private readonly refreshTokens;
    constructor(jwt: JwtService, config: ConfigService, refreshTokens: Repository<RefreshToken>);
    issueForLogin(claims: AccessTokenClaims, ctx: RequestContext): Promise<IssuedTokens>;
    private issue;
    rotate(presented: string, claims: AccessTokenClaims, ctx: RequestContext): Promise<IssuedTokens>;
    revoke(presented: string): Promise<void>;
    revokeFamily(familyId: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<void>;
    purgeExpired(): Promise<number>;
    private parseAndLoad;
    peekUserId(presented: string): Promise<string | null>;
    fingerprint(token: string): string;
}
export {};
