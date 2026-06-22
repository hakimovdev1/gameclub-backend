/** The single response envelope every successful endpoint returns. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  requestId: string;
  timestamp: string;
}

/** The single error envelope every failed request returns. */
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
