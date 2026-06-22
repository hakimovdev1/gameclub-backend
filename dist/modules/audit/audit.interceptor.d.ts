import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuditService } from './audit.service';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly reflector;
    private readonly audit;
    constructor(reflector: Reflector, audit: AuditService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private extractId;
}
