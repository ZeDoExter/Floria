import { Body, Controller, Delete, Get, Param, Post, Put, Req, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CategoryOwnerGuard } from '../../common/guards/category-owner.guard.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogService) { }

  @Get()
  list(@Req() req: RequestWithUser, @Query('filterByOwner') filterByOwner?: string) {
    const userId = req.user?.userId;
    return this.catalog.listCategories(filterByOwner === 'true' && userId ? userId : undefined);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto, @Req() req: RequestWithUser) {
    const userId = req.user?.userId ?? '';
    return this.catalog.createCategory(dto, userId);
  }

  @Put(':id')
  @UseGuards(CategoryOwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req: RequestWithUser) {
    const userId = req.user?.userId ?? '';
    return this.catalog.updateCategory(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(CategoryOwnerGuard)
  remove(@Param('id') id: string) {
    return this.catalog.removeCategory(id);
  }
}
