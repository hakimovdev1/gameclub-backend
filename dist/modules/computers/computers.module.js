"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const computer_entity_1 = require("./entities/computer.entity");
const computers_service_1 = require("./computers.service");
const computers_controller_1 = require("./computers.controller");
const rooms_module_1 = require("../rooms/rooms.module");
let ComputersModule = class ComputersModule {
};
exports.ComputersModule = ComputersModule;
exports.ComputersModule = ComputersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([computer_entity_1.Computer]), rooms_module_1.RoomsModule],
        controllers: [computers_controller_1.ComputersController],
        providers: [computers_service_1.ComputersService],
        exports: [computers_service_1.ComputersService, typeorm_1.TypeOrmModule],
    })
], ComputersModule);
//# sourceMappingURL=computers.module.js.map