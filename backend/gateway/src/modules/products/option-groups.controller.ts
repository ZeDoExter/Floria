import { Body, Controller, Delete, Param, Post, Put, Req } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('option-groups')
export class OptionGroupsController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  create(@Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.post('product', '/option-groups', body, { user: req.user });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.put('product', `/option-groups/${id}`, body, { user: req.user });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proxy.delete('product', `/option-groups/${id}`, { user: req.user });
  }
}

