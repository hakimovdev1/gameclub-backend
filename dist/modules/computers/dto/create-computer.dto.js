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
exports.CreateComputerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateComputerDto {
    label;
    roomId;
    specs;
}
exports.CreateComputerDto = CreateComputerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PC-01' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], CreateComputerDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateComputerDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: { cpu: 'i5-12400F', gpu: 'RTX 3060', ram: '16GB' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateComputerDto.prototype, "specs", void 0);
//# sourceMappingURL=create-computer.dto.js.map