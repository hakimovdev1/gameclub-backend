import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Assigns a correlation id to every request (honouring an inbound
 * `x-request-id` from a trusted proxy/gateway), exposes it on the
 * response, and stores it on the request for structured logging and the
 * response/error envelopes.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const requestId =
      typeof incoming === 'string' && incoming.length > 0
        ? incoming
        : randomUUID();
    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}

export function getRequestId(req: Request): string {
  return (req as Request & { requestId?: string }).requestId ?? 'unknown';
}
