import { Role } from '../../../common/enums/role.enum';
export declare class CreateUserDto {
    email: string;
    fullName: string;
    password: string;
    role: Role;
}
