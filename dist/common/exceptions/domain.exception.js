"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = exports.BusinessRuleException = exports.ResourceNotFoundException = exports.DomainException = void 0;
const common_1 = require("@nestjs/common");
class DomainException extends Error {
    code;
    httpStatus;
    details;
    constructor(code, message, httpStatus = common_1.HttpStatus.BAD_REQUEST, details) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = details;
        this.name = new.target.name;
    }
}
exports.DomainException = DomainException;
class ResourceNotFoundException extends DomainException {
    constructor(resource, id) {
        super('NOT_FOUND', id ? `${resource} ${id} was not found` : `${resource} was not found`, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.ResourceNotFoundException = ResourceNotFoundException;
class BusinessRuleException extends DomainException {
    constructor(code, message, details) {
        super(code, message, common_1.HttpStatus.UNPROCESSABLE_ENTITY, details);
    }
}
exports.BusinessRuleException = BusinessRuleException;
class ConflictException extends DomainException {
    constructor(code, message, details) {
        super(code, message, common_1.HttpStatus.CONFLICT, details);
    }
}
exports.ConflictException = ConflictException;
//# sourceMappingURL=domain.exception.js.map