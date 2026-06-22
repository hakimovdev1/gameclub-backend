import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { DebtService } from '../debt/debt.service';
import { PaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class CustomersService {
    private readonly customers;
    private readonly debt;
    constructor(customers: Repository<Customer>, debt: DebtService);
    create(dto: CreateCustomerDto): Promise<Customer>;
    findAll(query: PaginationQueryDto, search?: string): Promise<PaginatedResult<Customer>>;
    private escapeLike;
    findById(id: string): Promise<Customer>;
    getProfile(id: string): Promise<Customer & {
        debtBalance: number;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<Customer>;
    remove(id: string): Promise<void>;
}
