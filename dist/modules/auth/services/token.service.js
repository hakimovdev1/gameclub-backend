"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const argon2 = __importStar(require("argon2"));
const refresh_token_entity_1 = require("../entities/refresh-token.entity");
let TokenService = class TokenService {
    jwt;
    config;
    refreshTokens;
    constructor(jwt, config, refreshTokens) {
        this.jwt = jwt;
        this.config = config;
        this.refreshTokens = refreshTokens;
    }
    async issueForLogin(claims, ctx) {
        return this.issue(claims, (0, crypto_1.randomUUID)(), ctx);
    }
    async issue(claims, familyId, ctx) {
        const accessToken = await this.jwt.signAsync({ ...claims }, {
            secret: this.config.get('auth.accessSecret'),
            expiresIn: this.config.get('auth.accessTtl'),
        });
        const secret = (0, crypto_1.randomBytes)(48).toString('base64url');
        const expiresAt = new Date(Date.now() + this.config.get('auth.refreshTtlMs'));
        const record = await this.refreshTokens.save(this.refreshTokens.create({
            userId: claims.sub,
            familyId,
            tokenHash: await argon2.hash(secret),
            expiresAt,
            userAgent: ctx.userAgent ?? null,
            ipAddress: ctx.ipAddress ?? null,
        }));
        return {
            accessToken,
            refreshToken: `${record.id}.${secret}`,
            refreshExpiresAt: expiresAt,
        };
    }
    async rotate(presented, claims, ctx) {
        const record = await this.parseAndLoad(presented);
        if (!record) {
            throw new Error('UNKNOWN_REFRESH_TOKEN');
        }
        if (record.revoked) {
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
    async revoke(presented) {
        const record = await this.parseAndLoad(presented);
        if (record && !record.revoked) {
            record.revoked = true;
            await this.refreshTokens.save(record);
        }
    }
    async revokeFamily(familyId) {
        await this.refreshTokens.update({ familyId }, { revoked: true });
    }
    async revokeAllForUser(userId) {
        await this.refreshTokens.update({ userId }, { revoked: true });
    }
    async purgeExpired() {
        const result = await this.refreshTokens
            .createQueryBuilder()
            .delete()
            .where('expires_at < now()')
            .execute();
        return result.affected ?? 0;
    }
    async parseAndLoad(presented) {
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
    async peekUserId(presented) {
        const id = presented.split('.')[0];
        if (!id) {
            return null;
        }
        const record = await this.refreshTokens.findOne({ where: { id } });
        return record?.userId ?? null;
    }
    fingerprint(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex').slice(0, 12);
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository])
], TokenService);
//# sourceMappingURL=token.service.js.map