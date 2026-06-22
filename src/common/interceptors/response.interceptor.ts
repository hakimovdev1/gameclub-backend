import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../http/api-response';
import { getRequestId } from '../middleware/request-id.middleware';

/**
 * Wraps every controller return value in the canonical success envelope.
 * Handlers can return either a bare payload or `{ data, meta }`; both are
 * normalised so clients see one consistent shape.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    const req = context.switchToHttp().getRequest<Request>();
    const requestId = getRequestId(req);

    return next.handle().pipe(
      map((payload) => {
        const isEnvelope =
          payload !== null &&
          typeof payload === 'object' &&
          'data' in (payload as Record<string, unknown>);

        const data = isEnvelope
          ? (payload as unknown as { data: T }).data
          : payload;
        const meta = isEnvelope
          ? (payload as unknown as { meta?: Record<string, unknown> }).meta
          : undefined;

        return {
          success: true,
          data,
          ...(meta ? { meta } : {}),
          requestId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
