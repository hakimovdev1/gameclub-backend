import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class RoomsService {
    private readonly rooms;
    constructor(rooms: Repository<Room>);
    create(dto: CreateRoomDto): Promise<Room>;
    findAll(query: PaginationQueryDto): Promise<PaginatedResult<Room>>;
    findById(id: string): Promise<Room>;
    update(id: string, dto: UpdateRoomDto): Promise<Room>;
    remove(id: string): Promise<void>;
}
