import { request as __request } from './core/request';
import { OpenAPI } from './core/OpenAPI';

export type StripeCheckoutItem = {
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type StripeCheckoutSessionResponse = {
  sessionId: string;
  url: string;
};

export const createStripeCheckoutSession = async (params: {
  orderId: string;
  items: StripeCheckoutItem[];
}): Promise<StripeCheckoutSessionResponse> => {
  const successUrl = `${window.location.origin}/checkout/success?orderId=${params.orderId}`;
  const cancelUrl = `${window.location.origin}/cart`;

  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/payments/checkout-session',
    body: {
      orderId: params.orderId,
      items: params.items,
      successUrl,
      cancelUrl,
    },
  });

  return response as StripeCheckoutSessionResponse;
};
