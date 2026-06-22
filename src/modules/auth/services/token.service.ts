import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, randomUUID, createHash } from 'crypto';
import * as argon2 from 'argon2';
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

/**
 * Owns the full lifecycle of access & refresh tokens, including rotation
 * and reuse detection. The opaque refresh token is `<id>.<secret>`; only
 * an Argon2 hash of the secret is persisted.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
  ) {}

  async issueForLogin(
    claims: AccessTokenClaims,
    ctx: RequestContext,
  ): Promise<IssuedTokens> {
    return this.issue(claims, randomUUID(), ctx);
  }

  private async issue(
    claims: AccessTokenClaims,
    familyId: string,
    ctx: RequestContext,
  ): Promise<IssuedTokens> {
    const accessToken = await this.jwt.signAsync(
      { ...claims },
      {
        secret: this.config.get<string>('auth.accessSecret'),
        // ttl is a string like "900s"; jsonwebtoken accepts it at runtime.
        expiresIn: this.config.get<string>(
          'auth.accessTtl',
        ) as unknown as number,
      },
    );

    const secret = randomBytes(48).toString('base64url');
    const expiresAt = new Date(
      Date.now() + this.config.get<number>('auth.refreshTtlMs')!,
    );

    const record = await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: claims.sub,
        familyId,
        tokenHash: await argon2.hash(secret),
        expiresAt,
        userAgent: ctx.userAgent ?? null,
        ipAddress: ctx.ipAddress ?? null,
      }),
    );

    return {
      accessToken,
      refreshToken: `${record.id}.${secret}`,
      refreshExpiresAt: expiresAt,
    };
  }

  /**
   * Validates and rotates a refresh token. Returns a freshly minted token
   * pair, or throws if the token is unknown, expired, or reused.
   */
  async rotate(
    presented: string,
    claims: AccessTokenClaims,
    ctx: RequestContext,
  ): Promise<IssuedTokens> {
    const record = await this.parseAndLoad(presented);

    if (!record) {
      throw new Error('UNKNOWN_REFRESH_TOKEN');
    }

    if (record.revoked) {
      // Reuse of a rotated token => credential theft: nuke the family.
      await this.revokeFamily(record.familyId);
      throw new Error('REFRESH_TOKEN_REUSED');
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    const next = await this.issue(claims, record.familyId, ctx);
    const nextId = next.refreshToken.split('.')[0];
    record.revoked = true;
    record.replacedBy = nextId;
    await this.refreshTokens.save(record);

    return next;
  }

  async revoke(presented: string): Promise<void> {
    const record = await this.parseAndLoad(presented);
    if (record && !record.revoked) {
      record.revoked = true;
      await this.refreshTokens.save(record);
    }
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.refreshTokens.update({ familyId }, { revoked: true });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokens.update({ userId }, { revoked: true });
  }

  /** Purge expired tokens — invoked by a scheduled maintenance job. */
  async purgeExpired(): Promise<number> {
    const result = await this.refreshTokens
      .createQueryBuilder()
      .delete()
      .where('expires_at < now()')
      .execute();
    return result.affected ?? 0;
  }

  private async parseAndLoad(presented: string): Promise<RefreshToken | null> {
    const [id, secret] = presented.split('.');
    if (!id || !secret) {
      return null;
    }
    const record = await this.refreshTokens.findOne({ where: { id } });
    if (!record) {
      return null;
    }
    const valid = await argon2
      .verify(record.tokenHash, secret)
      .catch(() => false);
    return valid ? record : null;
  }

  /** Resolves the owning user id from a refresh token without rotating it. */
  async peekUserId(presented: string): Promise<string | null> {
    const id = presented.split('.')[0];
    if (!id) {
      return null;
    }
    const record = await this.refreshTokens.findOne({ where: { id } });
    return record?.userId ?? null;
  }

  /** Stable digest used for logging without exposing the token. */
  fingerprint(token: string): string {
    return createHash('sha256').update(token).digest('hex').slice(0, 12);
  }
}
