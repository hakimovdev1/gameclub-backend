import { ComputersService } from './computers.service';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
import { ComputerStatus } from './entities/computer.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class ComputersController {
    private readonly computers;
    constructor(computers: ComputersService);
    create(dto: CreateComputerDto): Promise<import("./entities/computer.entity").Computer>;
    findAll(query: PaginationQueryDto, roomId?: string, status?: ComputerStatus): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/computer.entity").Computer>>;
    findOne(id: string): Promise<import("./entities/computer.entity").Computer>;
    update(id: string, dto: UpdateComputerDto): Promise<import("./entities/computer.entity").Computer>;
    remove(id: string): Promise<void>;
}
