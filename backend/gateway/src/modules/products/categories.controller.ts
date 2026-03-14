import { Body, Controller, Delete, Get, Param, Post, Put, Req, Query } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  list(@Req() req: RequestWithUser, @Query() query: Record<string, string>) {
    return this.proxy.get('inventory', '/categories', { user: req.user, params: query });
  }

  @Post()
  create(@Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.post('inventory', '/categories', body, { user: req.user });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown, @Req() req: RequestWithUser) {
    return this.proxy.put('inventory', `/categories/${id}`, body, { user: req.user });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proxy.delete('inventory', `/categories/${id}`, { user: req.user });
  }
}

