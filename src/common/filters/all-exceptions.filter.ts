import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../http/api-response';
import { getRequestId } from '../middleware/request-id.middleware';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Translates every thrown error into the canonical error envelope and a
 * stable machine-readable `code`. Internal details are never leaked to
 * clients; full context is logged with the request id for correlation.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = getRequestId(req);

    const { status, code, message, details } = this.normalise(exception);

    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${req.method} ${req.url} -> ${status} ${code}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${req.method} ${req.url} -> ${status} ${code}: ${message}`,
      );
    }

    const body: ApiErrorResponse = {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
      requestId,
      timestamp: new Date().toISOString(),
    };

    res.status(status).json(body);
  }

  private normalise(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof DomainException) {
      return {
        status: exception.httpStatus,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      let message = exception.message;
      let details: unknown;

      if (typeof response === 'object' && response !== null) {
        const r = response as Record<string, unknown>;
        if (Array.isArray(r.message)) {
          message = 'Validation failed';
          details = r.message;
        } else if (typeof r.message === 'string') {
          message = r.message;
        }
      }

      return { status, code: this.statusToCode(status), message, details };
    }

    if (exception instanceof QueryFailedError) {
      // Unique violation, FK violation, etc. — surface a safe message only.
      const driverCode = (exception as unknown as { code?: string }).code;
      if (driverCode === '23505') {
        return {
          status: HttpStatus.CONFLICT,
          code: 'RESOURCE_CONFLICT',
          message: 'A record with the same unique value already exists',
        };
      }
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'DATABASE_CONSTRAINT',
        message: 'The operation violates a data constraint',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
    };
    return map[status] ?? 'ERROR';
  }
}
