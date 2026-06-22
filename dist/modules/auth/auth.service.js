"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const password_service_1 = require("./services/password.service");
const token_service_1 = require("./services/token.service");
const audit_service_1 = require("../audit/audit.service");
const domain_exception_1 = require("../../common/exceptions/domain.exception");
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
let AuthService = class AuthService {
    users;
    passwords;
    tokens;
    audit;
    constructor(users, passwords, tokens, audit) {
        this.users = users;
        this.passwords = passwords;
        this.tokens = tokens;
        this.audit = audit;
    }
    async login(dto, ctx) {
        const user = await this.users.findByEmailWithSecret(dto.email);
        const genericError = new common_1.UnauthorizedException('Invalid credentials');
        if (!user || !user.isActive) {
            throw genericError;
        }
        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
            throw new common_1.UnauthorizedException('Account temporarily locked due to failed login attempts');
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
    async refresh(presented, ctx) {
        if (!presented) {
            throw new common_1.UnauthorizedException('Missing refresh token');
        }
        try {
            const tokens = await this.tokens.rotate(presented, await this.claimsFromRefresh(presented), ctx);
            return tokens;
        }
        catch (err) {
            const code = err instanceof Error ? err.message : 'REFRESH_FAILED';
            throw new common_1.UnauthorizedException(code === 'REFRESH_TOKEN_REUSED'
                ? 'Refresh token reuse detected; all sessions revoked'
                : 'Invalid or expired refresh token');
        }
    }
    async logout(presented) {
        if (presented) {
            await this.tokens.revoke(presented);
        }
    }
    async changePassword(userId, dto, ctx) {
        const user = await this.users.findByIdWithSecret(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const ok = await this.passwords.verify(user.passwordHash, dto.currentPassword);
        if (!ok) {
            throw new domain_exception_1.BusinessRuleException('WRONG_PASSWORD', 'Current password is incorrect');
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
    async getProfile(userId) {
        return this.users.findById(userId);
    }
    async registerFailure(user) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
            user.failedLoginAttempts = 0;
        }
        await this.users.save(user);
    }
    async claimsFromRefresh(presented) {
        const userId = await this.resolveUserIdFromRefresh(presented);
        const user = await this.users.findById(userId);
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is disabled');
        }
        return this.toClaims(user);
    }
    async resolveUserIdFromRefresh(presented) {
        const userId = await this.tokens.peekUserId(presented);
        if (!userId) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        return userId;
    }
    toClaims(user) {
        return { sub: user.id, email: user.email, role: user.role };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        password_service_1.PasswordService,
        token_service_1.TokenService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map