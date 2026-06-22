export declare class CacheService {
    private readonly store;
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttlSeconds: number): void;
    del(key: string): void;
    delByPrefix(prefix: string): void;
    getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T>;
}
