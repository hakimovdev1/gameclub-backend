import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_KEY, AuditMetadata } from './audit.decorator';
import { AuditService } from './audit.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { getRequestId } from '../../common/middleware/request-id.middleware';

/**
 * Captures an audit entry for any handler annotated with @Audited once it
 * completes successfully. The entity id is resolved from the response body
 * (preferred) or the route params, and the request body is recorded as
 * the new value (secrets redacted in the service).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditMetadata>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!meta) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const user = (req as Request & { user?: AuthenticatedUser }).user;

    const body = (req.body ?? {}) as Record<string, unknown>;
    return next.handle().pipe(
      tap((result) => {
        const entityId =
          this.extractId(result) ??
          (req.params?.id as string | undefined) ??
          null;
        void this.audit.record({
          actorId: user?.sub ?? null,
          actorEmail: user?.email ?? null,
          action: meta.action,
          entity: meta.entity,
          entityId,
          newValue: Object.keys(body).length ? body : result,
          ipAddress: req.ip ?? null,
          userAgent: req.headers['user-agent'] ?? null,
          requestId: getRequestId(req),
        });
      }),
    );
  }

  private extractId(result: unknown): string | null {
    if (result && typeof result === 'object' && 'id' in result) {
      const id = result.id;
      return typeof id === 'string' ? id : null;
    }
    return null;
  }
}
