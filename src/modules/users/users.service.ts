import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordService } from '../auth/services/password.service';
import {
  ConflictException,
  ResourceNotFoundException,
} from '../../common/exceptions/domain.exception';
import {
  PaginatedResult,
  PaginationQueryDto,
  paginate,
} from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly passwords: PasswordService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const email = this.normalizeEmail(dto.email);
    const exists = await this.users.exists({ where: { email } });
    if (exists) {
      throw new ConflictException(
        'EMAIL_TAKEN',
        'A user with this email already exists',
      );
    }
    const user = this.users.create({
      email,
      fullName: dto.fullName,
      role: dto.role,
      passwordHash: await this.passwords.hash(dto.password),
    });
    return this.users.save(user);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    const [items, total] = await this.users.findAndCount({
      order: { createdAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  async findById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new ResourceNotFoundException('User', id);
    }
    return user;
  }

  /** Includes the password hash; used only by the auth flow. */
  findByEmailWithSecret(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: this.normalizeEmail(email) })
      .getOne();
  }

  /** Includes the password hash by id; used only by the auth flow. */
  findByIdWithSecret(id: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id })
      .getOne();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.users.save(user);
  }

  async setPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    user.passwordHash = await this.passwords.hash(newPassword);
    await this.users.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.users.softRemove(user);
  }

  /** Persist authentication bookkeeping (login success/lockout state). */
  async save(user: User): Promise<User> {
    return this.users.save(user);
  }
}
