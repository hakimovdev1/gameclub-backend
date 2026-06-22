import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
export declare class SettingsService {
    private readonly settings;
    constructor(settings: Repository<Setting>);
    getAll(): Promise<Record<string, unknown>>;
    get<T = unknown>(key: string): Promise<T | undefined>;
    set(key: string, value: unknown, updatedBy: string): Promise<Setting>;
}
