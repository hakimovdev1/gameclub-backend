import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class RoomsController {
    private readonly rooms;
    constructor(rooms: RoomsService);
    create(dto: CreateRoomDto): Promise<import("./entities/room.entity").Room>;
    findAll(query: PaginationQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/room.entity").Room>>;
    findOne(id: string): Promise<import("./entities/room.entity").Room>;
    update(id: string, dto: UpdateRoomDto): Promise<import("./entities/room.entity").Room>;
    remove(id: string): Promise<void>;
}
