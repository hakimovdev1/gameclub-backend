import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    create(dto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    findAll(query: PaginationQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/user.entity").User>>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, dto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
