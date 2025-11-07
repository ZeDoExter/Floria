import { Body, Controller, Delete, Param, Post, Put, Req } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('options')
export class OptionsController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  create(@Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.post('product', '/options', body, { user: req.user });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.put('product', `/options/${id}`, body, { user: req.user });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proxy.delete('product', `/options/${id}`, { user: req.user });
  }
}

