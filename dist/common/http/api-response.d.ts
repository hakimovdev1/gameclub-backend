export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    meta?: Record<string, unknown>;
    requestId: string;
    timestamp: string;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    requestId: string;
    timestamp: string;
}
