import { Controller, Post, Body, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('payments')
export class PaymentController {
    constructor(private readonly proxy: ProxyService) { }

    @Post('checkout-session')
    createCheckoutSession(@Body() body: any, @Req() req: RequestWithUser) {
        return this.proxy.post('payment', '/payments/checkout-session', body, { user: req.user, headers: req.headers as any });
    }

    @Post('webhook')
    async handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: RawBodyRequest<Request>) {
        // This assumes proxy post can forward raw body if needed, or we just forward the request
        return this.proxy.post('payment', '/payments/webhook', req.body, { headers: { 'stripe-signature': signature } as any });
    }
}
