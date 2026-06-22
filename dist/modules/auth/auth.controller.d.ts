import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare const REFRESH_TOKEN_COOKIE = "refresh_token";
export declare class AuthController {
    private readonly auth;
    private readonly config;
    constructor(auth: AuthService, config: ConfigService);
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        authenticated: boolean;
    }>;
    refresh(req: Request, res: Response): Promise<{
        authenticated: boolean;
    }>;
    logout(req: Request, res: Response): Promise<{
        authenticated: boolean;
    }>;
    me(user: AuthenticatedUser): Promise<import("../users/entities/user.entity").User>;
    changePassword(user: AuthenticatedUser, dto: ChangePasswordDto, req: Request, res: Response): Promise<{
        passwordChanged: boolean;
    }>;
    private ctx;
    private readRefreshCookie;
    private setCookies;
    private clearCookies;
}
