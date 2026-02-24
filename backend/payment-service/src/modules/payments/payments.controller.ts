import { Controller, Post, Body, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('checkout-session')
    async createCheckoutSession(
        @Body() body: { orderId: string; items: any[]; successUrl: string; cancelUrl: string },
        @Req() req: any
    ) {
        const userId = req.headers['x-user-id'] || 'anonymous';
        const email = req.headers['x-user-email'] || 'guest@example.com';

        return this.paymentsService.createCheckoutSession(
            userId as string,
            email as string,
            body.orderId,
            body.items,
            body.successUrl,
            body.cancelUrl
        );
    }

    @Post('webhook')
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: RawBodyRequest<Request>
    ) {
        if (!signature) {
            throw new Error('Missing stripe-signature header');
        }

        // NestJS rawBody must be enabled in main.ts nestFactory options
        const raw = req.rawBody;
        if (!raw) {
            throw new Error('Raw body not found. Ensure rawBody: true is set in NestFactory.create()');
        }

        return this.paymentsService.handleWebhook(signature, raw);
    }
}
