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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.REFRESH_TOKEN_COOKIE = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const request_id_middleware_1 = require("../../common/middleware/request-id.middleware");
exports.REFRESH_TOKEN_COOKIE = 'refresh_token';
let AuthController = class AuthController {
    auth;
    config;
    constructor(auth, config) {
        this.auth = auth;
        this.config = config;
    }
    async login(dto, req, res) {
        const tokens = await this.auth.login(dto, this.ctx(req));
        this.setCookies(res, tokens);
        return { authenticated: true };
    }
    async refresh(req, res) {
        const presented = this.readRefreshCookie(req);
        const tokens = await this.auth.refresh(presented, this.ctx(req));
        this.setCookies(res, tokens);
        return { authenticated: true };
    }
    async logout(req, res) {
        await this.auth.logout(this.readRefreshCookie(req));
        this.clearCookies(res);
        return { authenticated: false };
    }
    me(user) {
        return this.auth.getProfile(user.sub);
    }
    async changePassword(user, dto, req, res) {
        await this.auth.changePassword(user.sub, dto, this.ctx(req));
        this.clearCookies(res);
        return { passwordChanged: true };
    }
    ctx(req) {
        return {
            userAgent: req.headers['user-agent'] ?? null,
            ipAddress: req.ip ?? null,
            requestId: (0, request_id_middleware_1.getRequestId)(req),
        };
    }
    readRefreshCookie(req) {
        const cookies = req
            .cookies;
        return cookies?.[exports.REFRESH_TOKEN_COOKIE] ?? '';
    }
    setCookies(res, tokens) {
        const secure = this.config.get('auth.cookieSecure') ?? false;
        const domain = this.config.get('auth.cookieDomain');
        const base = {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            domain,
            path: '/',
        };
        res.cookie(jwt_auth_guard_1.ACCESS_TOKEN_COOKIE, tokens.accessToken, {
            ...base,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie(exports.REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
            ...base,
            path: '/api',
            expires: tokens.refreshExpiresAt,
        });
    }
    clearCookies(res) {
        const domain = this.config.get('auth.cookieDomain');
        res.clearCookie(jwt_auth_guard_1.ACCESS_TOKEN_COOKIE, { domain, path: '/' });
        res.clearCookie(exports.REFRESH_TOKEN_COOKIE, { domain, path: '/api' });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate and receive token cookies' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate refresh token and renew access token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke the current refresh token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get the authenticated profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Change own password and revoke other sessions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map