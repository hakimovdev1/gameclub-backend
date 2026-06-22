import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from '../http/api-response';
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponse<T>>;
}
