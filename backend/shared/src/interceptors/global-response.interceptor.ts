import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccess } from '../contracts/api-response.js';

@Injectable()
export class GlobalResponseInterceptor<T> implements NestInterceptor<T, ApiSuccess<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiSuccess<T>> {
        return next.handle().pipe(
            map(data => ({
                statusCode: context.switchToHttp().getResponse().statusCode,
                message: 'Success',
                data,
            })),
        );
    }
}
