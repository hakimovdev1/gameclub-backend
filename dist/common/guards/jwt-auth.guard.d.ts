import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
export declare const ACCESS_TOKEN_COOKIE = "access_token";
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwt;
    private readonly reflector;
    private readonly config;
    constructor(jwt: JwtService, reflector: Reflector, config: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
}
