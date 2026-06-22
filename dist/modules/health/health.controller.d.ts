import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    live(): {
        status: string;
        uptime: number;
    };
    ready(): Promise<{
        status: string;
        checks: {
            database: string;
        };
    }>;
}
