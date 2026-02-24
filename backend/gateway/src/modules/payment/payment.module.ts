import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { ProxyModule } from '../proxy/proxy.module.js';

@Module({
    imports: [ProxyModule],
    controllers: [PaymentController]
})
export class PaymentModule { }
