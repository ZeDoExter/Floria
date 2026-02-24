import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiError } from '../contracts/api-response.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : { message: 'Internal server error' };

        let message = 'Internal server error';
        let details: unknown;
        let errorCode = 'INTERNAL_ERROR';

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const respObj = exceptionResponse as any;
            message = respObj.message || message;
            errorCode = respObj.error || errorCode;
            if (Array.isArray(message)) {
                details = message;
                message = 'Validation failed';
                errorCode = 'VALIDATION_ERROR';
            }
        } else if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        }

        const errorBody: ApiError = {
            statusCode: status,
            message,
            errorCode,
            details,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        response.status(status).json(errorBody);
    }
}
