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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const password_service_1 = require("../auth/services/password.service");
const domain_exception_1 = require("../../common/exceptions/domain.exception");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let UsersService = class UsersService {
    users;
    passwords;
    constructor(users, passwords) {
        this.users = users;
        this.passwords = passwords;
    }
    async create(dto) {
        const email = this.normalizeEmail(dto.email);
        const exists = await this.users.exists({ where: { email } });
        if (exists) {
            throw new domain_exception_1.ConflictException('EMAIL_TAKEN', 'A user with this email already exists');
        }
        const user = this.users.create({
            email,
            fullName: dto.fullName,
            role: dto.role,
            passwordHash: await this.passwords.hash(dto.password),
        });
        return this.users.save(user);
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    async findAll(query) {
        const [items, total] = await this.users.findAndCount({
            order: { createdAt: 'DESC' },
            skip: query.skip,
            take: query.limit,
        });
        return (0, pagination_dto_1.paginate)(items, total, query);
    }
    async findById(id) {
        const user = await this.users.findOne({ where: { id } });
        if (!user) {
            throw new domain_exception_1.ResourceNotFoundException('User', id);
        }
        return user;
    }
    findByEmailWithSecret(email) {
        return this.users
            .createQueryBuilder('u')
            .addSelect('u.passwordHash')
            .where('u.email = :email', { email: this.normalizeEmail(email) })
            .getOne();
    }
    findByIdWithSecret(id) {
        return this.users
            .createQueryBuilder('u')
            .addSelect('u.passwordHash')
            .where('u.id = :id', { id })
            .getOne();
    }
    async update(id, dto) {
        const user = await this.findById(id);
        Object.assign(user, dto);
        return this.users.save(user);
    }
    async setPassword(id, newPassword) {
        const user = await this.findById(id);
        user.passwordHash = await this.passwords.hash(newPassword);
        await this.users.save(user);
    }
    async remove(id) {
        const user = await this.findById(id);
        await this.users.softRemove(user);
    }
    async save(user) {
        return this.users.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        password_service_1.PasswordService])
], UsersService);
//# sourceMappingURL=users.service.js.map