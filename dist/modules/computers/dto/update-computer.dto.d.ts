import { CreateComputerDto } from './create-computer.dto';
import { ComputerStatus } from '../entities/computer.entity';
declare const UpdateComputerDto_base: import("@nestjs/common").Type<Partial<CreateComputerDto>>;
export declare class UpdateComputerDto extends UpdateComputerDto_base {
    status?: ComputerStatus;
    isActive?: boolean;
}
export {};
