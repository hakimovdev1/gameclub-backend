import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { DebtService } from '../debt/debt.service';
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
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    private readonly debt: DebtService,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    if (dto.phone) {
      const exists = await this.customers.exists({
        where: { phone: dto.phone },
      });
      if (exists) {
        throw new ConflictException(
          'PHONE_TAKEN',
          'A customer with this phone already exists',
        );
      }
    }
    return this.customers.save(this.customers.create(dto));
  }

  async findAll(
    query: PaginationQueryDto,
    search?: string,
  ): Promise<PaginatedResult<Customer>> {
    // Escape LIKE metacharacters so user input can't inject wildcards.
    const term = search ? this.escapeLike(search) : undefined;
    const where = term
      ? [{ fullName: ILike(`%${term}%`) }, { phone: ILike(`%${term}%`) }]
      : undefined;
    const [items, total] = await this.customers.findAndCount({
      where,
      order: { fullName: 'ASC' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  private escapeLike(input: string): string {
    return input.replace(/[\\%_]/g, (m) => `\\${m}`);
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customers.findOne({ where: { id } });
    if (!customer) {
      throw new ResourceNotFoundException('Customer', id);
    }
    return customer;
  }

  /** Customer profile enriched with the live ledger balance. */
  async getProfile(id: string): Promise<Customer & { debtBalance: number }> {
    const customer = await this.findById(id);
    const balance = await this.debt.getBalance(id);
    return Object.assign(customer, { debtBalance: balance.value });
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id);
    if (dto.phone && dto.phone !== customer.phone) {
      const exists = await this.customers.exists({
        where: { phone: dto.phone },
      });
      if (exists) {
        throw new ConflictException(
          'PHONE_TAKEN',
          'A customer with this phone already exists',
        );
      }
    }
    Object.assign(customer, dto);
    return this.customers.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findById(id);
    await this.customers.softRemove(customer);
  }
}
