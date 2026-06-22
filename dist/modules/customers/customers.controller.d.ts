import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomersQueryDto } from './dto/list-customers.dto';
export declare class CustomersController {
    private readonly customers;
    constructor(customers: CustomersService);
    create(dto: CreateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    findAll(query: ListCustomersQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/customer.entity").Customer>>;
    findOne(id: string): Promise<import("./entities/customer.entity").Customer & {
        debtBalance: number;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    remove(id: string): Promise<void>;
}
