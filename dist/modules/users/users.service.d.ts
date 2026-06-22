import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordService } from '../auth/services/password.service';
import { PaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private readonly users;
    private readonly passwords;
    constructor(users: Repository<User>, passwords: PasswordService);
    create(dto: CreateUserDto): Promise<User>;
    private normalizeEmail;
    findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>>;
    findById(id: string): Promise<User>;
    findByEmailWithSecret(email: string): Promise<User | null>;
    findByIdWithSecret(id: string): Promise<User | null>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    setPassword(id: string, newPassword: string): Promise<void>;
    remove(id: string): Promise<void>;
    save(user: User): Promise<User>;
}
