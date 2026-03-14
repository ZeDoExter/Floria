/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginDto } from '../models/LoginDto';
import type { RegisterDto } from '../models/RegisterDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static authControllerRegister(
        requestBody: RegisterDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/profile',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static productsControllerList(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static productsControllerCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static productsControllerDetail(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static productsControllerUpdate(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/products/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static productsControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/products/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static categoriesControllerList(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/categories',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static categoriesControllerCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/categories',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static categoriesControllerUpdate(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static categoriesControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static optionGroupsControllerCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/option-groups',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static optionGroupsControllerUpdate(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/option-groups/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static optionGroupsControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/option-groups/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static optionsControllerCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/options',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static optionsControllerUpdate(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/options/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static optionsControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/options/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param anonymousId
     * @returns any
     * @throws ApiError
     */
    public static cartControllerGetCart(
        anonymousId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/cart',
            query: {
                'anonymousId': anonymousId,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static cartControllerMerge(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/cart/merge',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static cartControllerAddItem(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/cart/items',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static cartControllerUpdateItem(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/cart/items/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static cartControllerRemoveItem(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/cart/items/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static ordersControllerList(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static ordersControllerCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static ordersControllerListCustomerOrders(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/customer-orders',
        });
    }
    /**
     * @param orderId
     * @returns any
     * @throws ApiError
     */
    public static ordersControllerUpdateStatus(
        orderId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/orders/{orderId}/status',
            path: {
                'orderId': orderId,
            },
        });
    }
    /**
     * @param q
     * @returns any
     * @throws ApiError
     */
    public static searchControllerSearchProducts(
        q: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/search/products',
            query: {
                'q': q,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static usersControllerList(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users',
        });
    }
    /**
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static usersControllerGetUser(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static paymentControllerCreateCheckoutSession(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payments/checkout-session',
        });
    }
    /**
     * @param stripeSignature
     * @returns any
     * @throws ApiError
     */
    public static paymentControllerHandleWebhook(
        stripeSignature: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payments/webhook',
            headers: {
                'stripe-signature': stripeSignature,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static healthControllerCheck(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/healthz',
        });
    }
}
