import { HttpStatus } from '@nestjs/common';

/**
 * Base class for business-rule violations. Unlike generic HttpExceptions,
 * a DomainException always carries a stable `code` that clients can switch
 * on, decoupled from HTTP wording. Throw these from services; the global
 * filter renders them into the error envelope.
 */
export class DomainException extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} ${id} was not found` : `${resource} was not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class BusinessRuleException extends DomainException {
  constructor(code: string, message: string, details?: unknown) {
    super(code, message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

export class ConflictException extends DomainException {
  constructor(code: string, message: string, details?: unknown) {
    super(code, message, HttpStatus.CONFLICT, details);
  }
}
