import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './proxy.service.js';

@Global()
@Module({
  imports: [HttpModule],
  providers: [ProxyService],
  exports: [ProxyService]
})
export class ProxyModule {}
