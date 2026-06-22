import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { ACCESS_TOKEN_COOKIE } from '../../common/guards/jwt-auth.guard';
import { getRequestId } from '../../common/middleware/request-id.middleware';
import { IssuedTokens } from './services/token.service';

export const REFRESH_TOKEN_COOKIE = 'refresh_token';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate and receive token cookies' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.auth.login(dto, this.ctx(req));
    this.setCookies(res, tokens);
    return { authenticated: true };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Rotate refresh token and renew access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const presented = this.readRefreshCookie(req);
    const tokens = await this.auth.refresh(presented, this.ctx(req));
    this.setCookies(res, tokens);
    return { authenticated: true };
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(this.readRefreshCookie(req));
    this.clearCookies(res);
    return { authenticated: false };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated profile' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getProfile(user.sub);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change own password and revoke other sessions' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.changePassword(user.sub, dto, this.ctx(req));
    this.clearCookies(res);
    return { passwordChanged: true };
  }

  private ctx(req: Request) {
    return {
      userAgent: req.headers['user-agent'] ?? null,
      ipAddress: req.ip ?? null,
      requestId: getRequestId(req),
    };
  }

  private readRefreshCookie(req: Request): string {
    const cookies = (req as unknown as { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[REFRESH_TOKEN_COOKIE] ?? '';
  }

  private setCookies(res: Response, tokens: IssuedTokens): void {
    const secure = this.config.get<boolean>('auth.cookieSecure') ?? false;
    const domain = this.config.get<string>('auth.cookieDomain');
    const base = {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      domain,
      path: '/',
    };

    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...base,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...base,
      path: '/api',
      expires: tokens.refreshExpiresAt,
    });
  }

  private clearCookies(res: Response): void {
    const domain = this.config.get<string>('auth.cookieDomain');
    res.clearCookie(ACCESS_TOKEN_COOKIE, { domain, path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { domain, path: '/api' });
  }
}
