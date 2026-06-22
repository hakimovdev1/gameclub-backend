"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const request_id_middleware_1 = require("../middleware/request-id.middleware");
const domain_exception_1 = require("../exceptions/domain.exception");
let AllExceptionsFilter = class AllExceptionsFilter {
    logger = new common_1.Logger('Exceptions');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        const requestId = (0, request_id_middleware_1.getRequestId)(req);
        const { status, code, message, details } = this.normalise(exception);
        if (status >= 500) {
            this.logger.error(`[${requestId}] ${req.method} ${req.url} -> ${status} ${code}`, exception instanceof Error ? exception.stack : String(exception));
        }
        else {
            this.logger.warn(`[${requestId}] ${req.method} ${req.url} -> ${status} ${code}: ${message}`);
        }
        const body = {
            success: false,
            error: { code, message, ...(details ? { details } : {}) },
            requestId,
            timestamp: new Date().toISOString(),
        };
        res.status(status).json(body);
    }
    normalise(exception) {
        if (exception instanceof domain_exception_1.DomainException) {
            return {
                status: exception.httpStatus,
                code: exception.code,
                message: exception.message,
                details: exception.details,
            };
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();
            let message = exception.message;
            let details;
            if (typeof response === 'object' && response !== null) {
                const r = response;
                if (Array.isArray(r.message)) {
                    message = 'Validation failed';
                    details = r.message;
                }
                else if (typeof r.message === 'string') {
                    message = r.message;
                }
            }
            return { status, code: this.statusToCode(status), message, details };
        }
        if (exception instanceof typeorm_1.QueryFailedError) {
            const driverCode = exception.code;
            if (driverCode === '23505') {
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    code: 'RESOURCE_CONFLICT',
                    message: 'A record with the same unique value already exists',
                };
            }
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                code: 'DATABASE_CONSTRAINT',
                message: 'The operation violates a data constraint',
            };
        }
        return {
            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        };
    }
    statusToCode(status) {
        const map = {
            [common_1.HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
            [common_1.HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
            [common_1.HttpStatus.FORBIDDEN]: 'FORBIDDEN',
            [common_1.HttpStatus.NOT_FOUND]: 'NOT_FOUND',
            [common_1.HttpStatus.CONFLICT]: 'CONFLICT',
            [common_1.HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
            [common_1.HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
        };
        return map[status] ?? 'ERROR';
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map