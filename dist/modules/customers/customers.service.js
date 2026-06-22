"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const debt_service_1 = require("../debt/debt.service");
const domain_exception_1 = require("../../common/exceptions/domain.exception");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let CustomersService = class CustomersService {
    customers;
    debt;
    constructor(customers, debt) {
        this.customers = customers;
        this.debt = debt;
    }
    async create(dto) {
        if (dto.phone) {
            const exists = await this.customers.exists({
                where: { phone: dto.phone },
            });
            if (exists) {
                throw new domain_exception_1.ConflictException('PHONE_TAKEN', 'A customer with this phone already exists');
            }
        }
        return this.customers.save(this.customers.create(dto));
    }
    async findAll(query, search) {
        const term = search ? this.escapeLike(search) : undefined;
        const where = term
            ? [{ fullName: (0, typeorm_2.ILike)(`%${term}%`) }, { phone: (0, typeorm_2.ILike)(`%${term}%`) }]
            : undefined;
        const [items, total] = await this.customers.findAndCount({
            where,
            order: { fullName: 'ASC' },
            skip: query.skip,
            take: query.limit,
        });
        return (0, pagination_dto_1.paginate)(items, total, query);
    }
    escapeLike(input) {
        return input.replace(/[\\%_]/g, (m) => `\\${m}`);
    }
    async findById(id) {
        const customer = await this.customers.findOne({ where: { id } });
        if (!customer) {
            throw new domain_exception_1.ResourceNotFoundException('Customer', id);
        }
        return customer;
    }
    async getProfile(id) {
        const customer = await this.findById(id);
        const balance = await this.debt.getBalance(id);
        return Object.assign(customer, { debtBalance: balance.value });
    }
    async update(id, dto) {
        const customer = await this.findById(id);
        if (dto.phone && dto.phone !== customer.phone) {
            const exists = await this.customers.exists({
                where: { phone: dto.phone },
            });
            if (exists) {
                throw new domain_exception_1.ConflictException('PHONE_TAKEN', 'A customer with this phone already exists');
            }
        }
        Object.assign(customer, dto);
        return this.customers.save(customer);
    }
    async remove(id) {
        const customer = await this.findById(id);
        await this.customers.softRemove(customer);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        debt_service_1.DebtService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map