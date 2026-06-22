export declare class PaginationQueryDto {
    page: number;
    limit: number;
    get skip(): number;
}
export interface PaginatedResult<T> {
    items: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare function paginate<T>(items: T[], total: number, query: PaginationQueryDto): PaginatedResult<T>;
