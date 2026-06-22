import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PasswordService } from './services/password.service';
import { TokenService, IssuedTokens } from './services/token.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/entities/user.entity';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { BusinessRuleException } from '../../common/exceptions/domain.exception';

interface RequestContext {
  userAgent?: string | null;
  ipAddress?: string | null;
  requestId?: string | null;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Authenticates a staff member. Brute force is mitigated with a per-
   * account failure counter and timed lockout. The same generic error is
   * returned for unknown email and wrong password to avoid user
   * enumeration.
   */
  async login(dto: LoginDto, ctx: RequestContext): Promise<IssuedTokens> {
    const user = await this.users.findByEmailWithSecret(dto.email);
    const genericError = new UnauthorizedException('Invalid credentials');

    if (!user || !user.isActive) {
      throw genericError;
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new UnauthorizedException(
        'Account temporarily locked due to failed login attempts',
      );
    }

    const ok = await this.passwords.verify(user.passwordHash, dto.password);
    if (!ok) {
      await this.registerFailure(user);
      await this.audit.record({
        actorId: user.id,
        actorEmail: user.email,
        action: 'LOGIN_FAILED',
        entity: 'User',
        entityId: user.id,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });
      throw genericError;
    }

    // Successful login — reset lockout state and opportunistically rehash.
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    if (this.passwords.needsRehash(user.passwordHash)) {
      user.passwordHash = await this.passwords.hash(dto.password);
    }
    await this.users.save(user);

    await this.audit.record({
      actorId: user.id,
      actorEmail: user.email,
      action: 'LOGIN_SUCCESS',
      entity: 'User',
      entityId: user.id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return this.tokens.issueForLogin(this.toClaims(user), ctx);
  }

  async refresh(presented: string, ctx: RequestContext): Promise<IssuedTokens> {
    if (!presented) {
      throw new UnauthorizedException('Missing refresh token');
    }
    try {
      // Decode the user from the persisted token chain by re-loading the
      // user attached to the refresh record during rotation.
      const tokens = await this.tokens.rotate(
        presented,
        await this.claimsFromRefresh(presented),
        ctx,
      );
      return tokens;
    } catch (err) {
      const code = err instanceof Error ? err.message : 'REFRESH_FAILED';
      throw new UnauthorizedException(
        code === 'REFRESH_TOKEN_REUSED'
          ? 'Refresh token reuse detected; all sessions revoked'
          : 'Invalid or expired refresh token',
      );
    }
  }

  async logout(presented?: string): Promise<void> {
    if (presented) {
      await this.tokens.revoke(presented);
    }
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    ctx: RequestContext,
  ): Promise<void> {
    const user = await this.users.findByIdWithSecret(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const ok = await this.passwords.verify(
      user.passwordHash,
      dto.currentPassword,
    );
    if (!ok) {
      throw new BusinessRuleException(
        'WRONG_PASSWORD',
        'Current password is incorrect',
      );
    }
    await this.users.setPassword(userId, dto.newPassword);
    await this.tokens.revokeAllForUser(userId);
    await this.audit.record({
      actorId: userId,
      actorEmail: user.email,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: userId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  }

  async getProfile(userId: string): Promise<User> {
    return this.users.findById(userId);
  }

  private async registerFailure(user: User): Promise<void> {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await this.users.save(user);
  }

  private async claimsFromRefresh(
    presented: string,
  ): Promise<AuthenticatedUser> {
    // The refresh token id maps to a token row whose userId resolves the
    // current user; this guarantees claims reflect up-to-date role/email.
    const userId = await this.resolveUserIdFromRefresh(presented);
    const user = await this.users.findById(userId);
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }
    return this.toClaims(user);
  }

  private async resolveUserIdFromRefresh(presented: string): Promise<string> {
    const userId = await this.tokens.peekUserId(presented);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return userId;
  }

  private toClaims(user: User): AuthenticatedUser {
    return { sub: user.id, email: user.email, role: user.role };
  }
}
