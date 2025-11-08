import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export interface AuthenticatedUser {
  sub: string;
  cognito_user_id: string;
  displayName: string;
}

export interface ForwardContext {
  user?: AuthenticatedUser | null;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

@Injectable()
export class ProxyService {
  private readonly serviceUrls: Record<string, string>;

  constructor(private readonly http: HttpService, configService: ConfigService) {
    this.serviceUrls = {
      product: configService.get<string>('PRODUCT_SERVICE_URL', 'http://product-service:3001'),
      cart: configService.get<string>('CART_SERVICE_URL', 'http://cart-service:3002'),
      order: configService.get<string>('ORDER_SERVICE_URL', 'http://order-service:3003'),
      search: configService.get<string>('SEARCH_SERVICE_URL', 'http://search-service:3004')
    };
  }

  async get<T>(service: keyof ProxyService['serviceUrls'], path: string, context: ForwardContext = {}) {
    return this.request<T>('get', service, path, undefined, context);
  }

  async post<T>(service: keyof ProxyService['serviceUrls'], path: string, body: unknown, context: ForwardContext = {}) {
    return this.request<T>('post', service, path, body, context);
  }

  async patch<T>(service: keyof ProxyService['serviceUrls'], path: string, body: unknown, context: ForwardContext = {}) {
    return this.request<T>('patch', service, path, body, context);
  }

  async put<T>(service: keyof ProxyService['serviceUrls'], path: string, body: unknown, context: ForwardContext = {}) {
    return this.request<T>('put', service, path, body, context);
  }

  async delete<T>(service: keyof ProxyService['serviceUrls'], path: string, context: ForwardContext = {}) {
    return this.request<T>('delete', service, path, undefined, context);
  }

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    service: keyof ProxyService['serviceUrls'],
    path: string,
    body?: unknown,
    context: ForwardContext = {}
  ) {
    const baseUrl = this.serviceUrls[service];
    const url = `${baseUrl}${path}`;
    const headers: Record<string, string> = { 'content-type': 'application/json', ...(context.headers ?? {}) };

    if (context.user) {
      headers['x-user-id'] = context.user.cognito_user_id;
      headers['x-user-email'] = context.user.sub;
    }

    const response = await this.http.axiosRef.request<T>({
      method,
      url,
      data: body,
      params: context.params,
      headers
    });
    return response.data;
  }
}
