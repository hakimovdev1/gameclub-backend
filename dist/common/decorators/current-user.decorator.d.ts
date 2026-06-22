import { Role } from '../enums/role.enum';
export interface AuthenticatedUser {
    sub: string;
    email: string;
    role: Role;
}
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
