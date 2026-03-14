export interface ApiSuccess<T> {
    statusCode: number;
    message: string;
    data: T;
}

export interface ApiError {
    statusCode: number;
    message: string;
    errorCode: string;
    details?: unknown;
    timestamp: string;
    path: string;
}
