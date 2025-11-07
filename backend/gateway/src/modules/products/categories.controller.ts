import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: RequestWithUser) {
    return this.proxy.get('product', '/categories', { user: req.user });
  }

  @Post()
  create(@Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.post('product', '/categories', body, { user: req.user });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.put('product', `/categories/${id}`, body, { user: req.user });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proxy.delete('product', `/categories/${id}`, { user: req.user });
  }
}

