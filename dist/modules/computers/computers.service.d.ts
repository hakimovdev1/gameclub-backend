import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Computer, ComputerStatus } from './entities/computer.entity';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
import { RoomsService } from '../rooms/rooms.service';
import { PaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class ComputersService {
    private readonly computers;
    private readonly rooms;
    private readonly events;
    constructor(computers: Repository<Computer>, rooms: RoomsService, events: EventEmitter2);
    create(dto: CreateComputerDto): Promise<Computer>;
    findAll(query: PaginationQueryDto, filters?: {
        roomId?: string;
        status?: ComputerStatus;
    }): Promise<PaginatedResult<Computer>>;
    findById(id: string): Promise<Computer>;
    update(id: string, dto: UpdateComputerDto): Promise<Computer>;
    remove(id: string): Promise<void>;
    private toEvent;
}
