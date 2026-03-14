import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private configService: ConfigService,
        private httpService: HttpService
    ) {
        const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(stripeSecret || 'sk_test_fake', {
            apiVersion: '2023-10-16' as any,
        });
    }

    async createCheckoutSession(userId: string, email: string, orderId: string, items: any[], successUrl: string, cancelUrl: string) {
        // Fetch order details from order-service to verify amounts
        const orderUrl = this.configService.get<string>('ORDER_SERVICE_URL', 'http://order-service:3003');
        let order;
        try {
            const response = await lastValueFrom(
                this.httpService.get(`${orderUrl}/orders/${orderId}`, {
                    headers: {
                        'x-user-id': userId,
                        'x-user-email': email,
                        'x-user-role': 'owner' // Internal bypass or we need a proper internal auth
                    }
                })
            );
            order = response.data.order;
        } catch (error: any) {
            this.logger.error(`Failed to fetch order ${orderId} for payment verification: ${error.message}`);
            throw new Error('Could not verify order details');
        }

        const lineItems = order.items.map((item: any) => ({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: item.productName || 'Product',
                },
                unit_amount: Math.round(Number(item.unitPrice) * 100), // Ensure cents/satang
            },
            quantity: item.quantity,
        }));

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card', 'promptpay'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: email,
            metadata: {
                orderId,
                userId
            }
        });

        return { sessionId: session.id, url: session.url };
    }

    async handleWebhook(signature: string, payload: Buffer) {
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret || '');
        } catch (err: any) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw err;
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;

            if (orderId) {
                this.logger.log(`Payment successful for order ${orderId}`);
                // Notify order-service
                const orderUrl = this.configService.get<string>('ORDER_SERVICE_URL', 'http://order-service:3003');
                try {
                    await lastValueFrom(
                        this.httpService.patch(`${orderUrl}/orders/${orderId}/status`, {
                            status: 'PAID',
                            paymentRef: session.payment_intent as string
                        })
                    );
                } catch (error: any) {
                    this.logger.error(`Failed to update order status: ${error.message}`);
                }
            }
        }

        return { received: true };
    }
}
