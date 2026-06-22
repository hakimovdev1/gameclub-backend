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
exports.CorrectionDto = exports.RecordPaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RecordPaymentDto {
    amount;
    reason;
}
exports.RecordPaymentDto = RecordPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20000, description: 'Positive minor units' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RecordPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Cash payment at desk' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RecordPaymentDto.prototype, "reason", void 0);
class CorrectionDto {
    signedAmount;
    reason;
}
exports.CorrectionDto = CorrectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: -5000,
        description: 'Signed minor units; negative reduces debt',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.NotEquals)(0),
    __metadata("design:type", Number)
], CorrectionDto.prototype, "signedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Goodwill adjustment, approved by owner' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CorrectionDto.prototype, "reason", void 0);
//# sourceMappingURL=debt.dto.js.map