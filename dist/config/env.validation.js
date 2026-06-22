"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var NodeEnv;
(function (NodeEnv) {
    NodeEnv["Development"] = "development";
    NodeEnv["Production"] = "production";
    NodeEnv["Test"] = "test";
})(NodeEnv || (NodeEnv = {}));
class EnvironmentVariables {
    NODE_ENV = NodeEnv.Development;
    PORT;
    DB_HOST;
    DB_PORT;
    DB_USERNAME;
    DB_PASSWORD;
    DB_DATABASE;
    JWT_ACCESS_SECRET;
    JWT_REFRESH_SECRET;
}
__decorate([
    (0, class_validator_1.IsEnum)(NodeEnv),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_HOST", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "DB_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_USERNAME", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_DATABASE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(16),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_ACCESS_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(16),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_SECRET", void 0);
function validateEnv(config) {
    const validated = (0, class_transformer_1.plainToInstance)(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validated, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        const details = errors
            .map((e) => Object.values(e.constraints ?? {}).join(', '))
            .join('; ');
        throw new Error(`Invalid environment configuration: ${details}`);
    }
    if (validated.NODE_ENV === NodeEnv.Production) {
        const weak = (s) => !s || s.length < 32 || s.includes('change-me') || s.includes('dev-');
        if (weak(config.JWT_ACCESS_SECRET)) {
            throw new Error('JWT_ACCESS_SECRET must be a strong (>=32 char) secret in production');
        }
        if (weak(config.JWT_REFRESH_SECRET)) {
            throw new Error('JWT_REFRESH_SECRET must be a strong (>=32 char) secret in production');
        }
        if (String(config.DB_SYNCHRONIZE) === 'true') {
            throw new Error('DB_SYNCHRONIZE must be false in production; use migrations instead');
        }
    }
    return validated;
}
//# sourceMappingURL=env.validation.js.map