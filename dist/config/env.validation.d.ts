declare enum NodeEnv {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: NodeEnv;
    PORT: number;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    JWT_ACCESS_SECRET?: string;
    JWT_REFRESH_SECRET?: string;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
export {};
