export declare const appConfig: (() => {
    env: string;
    port: number;
    apiPrefix: string;
    defaultVersion: string;
    corsOrigins: string[];
    trustProxy: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: string;
    port: number;
    apiPrefix: string;
    defaultVersion: string;
    corsOrigins: string[];
    trustProxy: number;
}>;
export declare const databaseConfig: (() => {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
}>;
export declare const authConfig: (() => {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
    refreshTtlMs: number;
    cookieDomain: string | undefined;
    cookieSecure: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
    refreshTtlMs: number;
    cookieDomain: string | undefined;
    cookieSecure: boolean;
}>;
export declare const configurations: (((() => {
    env: string;
    port: number;
    apiPrefix: string;
    defaultVersion: string;
    corsOrigins: string[];
    trustProxy: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: string;
    port: number;
    apiPrefix: string;
    defaultVersion: string;
    corsOrigins: string[];
    trustProxy: number;
}>) | ((() => {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
}>) | ((() => {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
    refreshTtlMs: number;
    cookieDomain: string | undefined;
    cookieSecure: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
    refreshTtlMs: number;
    cookieDomain: string | undefined;
    cookieSecure: boolean;
}>))[];
