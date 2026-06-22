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
exports.StartSessionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const session_entity_1 = require("../entities/session.entity");
class StartSessionDto {
    computerIds;
    type;
    customerId;
    durationMinutes;
    plannedEndAt;
    notes;
}
exports.StartSessionDto = StartSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        description: 'One or more computers. Multiple ids create an atomic group session.',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], StartSessionDto.prototype, "computerIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: session_entity_1.SessionType }),
    (0, class_validator_1.IsEnum)(session_entity_1.SessionType),
    __metadata("design:type", String)
], StartSessionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid', description: 'Attach to a customer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StartSessionDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 60,
        description: 'Required for FIXED_DURATION. Minutes of play.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(24 * 60),
    __metadata("design:type", Number)
], StartSessionDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Required for FIXED_END_TIME (ISO 8601).',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], StartSessionDto.prototype, "plannedEndAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], StartSessionDto.prototype, "notes", void 0);
//# sourceMappingURL=start-session.dto.js.map