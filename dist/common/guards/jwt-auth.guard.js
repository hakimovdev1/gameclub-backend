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
exports.JwtAuthGuard = exports.ACCESS_TOKEN_COOKIE = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const public_decorator_1 = require("../decorators/public.decorator");
exports.ACCESS_TOKEN_COOKIE = 'access_token';
let JwtAuthGuard = class JwtAuthGuard {
    jwt;
    reflector;
    config;
    constructor(jwt, reflector, config) {
        this.jwt = jwt;
        this.reflector = reflector;
        this.config = config;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const req = context.switchToHttp().getRequest();
        const token = this.extractToken(req);
        if (!token) {
            throw new common_1.UnauthorizedException('Authentication token is missing');
        }
        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: this.config.get('auth.accessSecret'),
            });
            req.user = {
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired access token');
        }
    }
    extractToken(req) {
        const header = req.headers.authorization;
        if (header?.startsWith('Bearer ')) {
            return header.slice(7);
        }
        const cookies = req
            .cookies;
        return cookies?.[exports.ACCESS_TOKEN_COOKIE];
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        core_1.Reflector,
        config_1.ConfigService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map