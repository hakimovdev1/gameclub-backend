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
exports.RefreshToken = void 0;
const typeorm_1 = require("typeorm");
let RefreshToken = class RefreshToken {
    id;
    userId;
    familyId;
    tokenHash;
    revoked;
    replacedBy;
    expiresAt;
    userAgent;
    ipAddress;
    createdAt;
};
exports.RefreshToken = RefreshToken;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RefreshToken.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], RefreshToken.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'family_id', type: 'uuid' }),
    __metadata("design:type", String)
], RefreshToken.prototype, "familyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_hash', type: 'varchar' }),
    __metadata("design:type", String)
], RefreshToken.prototype, "tokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revoked', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], RefreshToken.prototype, "revoked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'replaced_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "replacedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "createdAt", void 0);
exports.RefreshToken = RefreshToken = __decorate([
    (0, typeorm_1.Entity)('refresh_tokens'),
    (0, typeorm_1.Index)('idx_refresh_family', ['familyId']),
    (0, typeorm_1.Index)('idx_refresh_user', ['userId'])
], RefreshToken);
//# sourceMappingURL=refresh-token.entity.js.map