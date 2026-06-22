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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputersService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const computer_entity_1 = require("./entities/computer.entity");
const rooms_service_1 = require("../rooms/rooms.service");
const domain_exception_1 = require("../../common/exceptions/domain.exception");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const realtime_events_1 = require("../realtime/realtime.events");
let ComputersService = class ComputersService {
    computers;
    rooms;
    events;
    constructor(computers, rooms, events) {
        this.computers = computers;
        this.rooms = rooms;
        this.events = events;
    }
    async create(dto) {
        await this.rooms.findById(dto.roomId);
        const computer = await this.computers.save(this.computers.create(dto));
        this.events.emit(realtime_events_1.DomainEvent.ComputerCreated, (0, realtime_events_1.buildEvent)(realtime_events_1.DomainEvent.ComputerCreated, this.toEvent(computer)));
        return computer;
    }
    async findAll(query, filters = {}) {
        const [items, total] = await this.computers.findAndCount({
            where: {
                ...(filters.roomId ? { roomId: filters.roomId } : {}),
                ...(filters.status ? { status: filters.status } : {}),
            },
            relations: { room: true },
            order: { label: 'ASC' },
            skip: query.skip,
            take: query.limit,
        });
        return (0, pagination_dto_1.paginate)(items, total, query);
    }
    async findById(id) {
        const computer = await this.computers.findOne({
            where: { id },
            relations: { room: true },
        });
        if (!computer) {
            throw new domain_exception_1.ResourceNotFoundException('Computer', id);
        }
        return computer;
    }
    async update(id, dto) {
        const computer = await this.findById(id);
        if (dto.roomId && dto.roomId !== computer.roomId) {
            await this.rooms.findById(dto.roomId);
        }
        Object.assign(computer, dto);
        const saved = await this.computers.save(computer);
        this.events.emit(realtime_events_1.DomainEvent.ComputerUpdated, (0, realtime_events_1.buildEvent)(realtime_events_1.DomainEvent.ComputerUpdated, this.toEvent(saved)));
        return saved;
    }
    async remove(id) {
        const computer = await this.findById(id);
        await this.computers.softRemove(computer);
    }
    toEvent(computer) {
        return {
            id: computer.id,
            label: computer.label,
            roomId: computer.roomId,
            status: computer.status,
        };
    }
};
exports.ComputersService = ComputersService;
exports.ComputersService = ComputersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(computer_entity_1.Computer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rooms_service_1.RoomsService,
        event_emitter_1.EventEmitter2])
], ComputersService);
//# sourceMappingURL=computers.service.js.map