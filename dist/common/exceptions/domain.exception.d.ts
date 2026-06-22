import { HttpStatus } from '@nestjs/common';
export declare class DomainException extends Error {
    readonly code: string;
    readonly httpStatus: HttpStatus;
    readonly details?: unknown | undefined;
    constructor(code: string, message: string, httpStatus?: HttpStatus, details?: unknown | undefined);
}
export declare class ResourceNotFoundException extends DomainException {
    constructor(resource: string, id?: string);
}
export declare class BusinessRuleException extends DomainException {
    constructor(code: string, message: string, details?: unknown);
}
export declare class ConflictException extends DomainException {
    constructor(code: string, message: string, details?: unknown);
}
