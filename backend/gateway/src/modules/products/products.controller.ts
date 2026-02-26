import { Body, Controller, Get, Param, Post, Put, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { RequestWithUser } from '../../common/auth.middleware.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductOwnerGuard } from '../../common/guards/product-owner.guard.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly catalog: CatalogService) { }

  @Get()
  list(@Req() req: RequestWithUser, @Query('filterByOwner') filterByOwner?: string) {
    const userId = req.user?.userId;
    return this.catalog.listProducts(filterByOwner === 'true' && userId ? userId : undefined);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.catalog.getProduct(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @Req() req: RequestWithUser) {
    const userId = req.user?.userId ?? '';
    return this.catalog.createProduct(dto, userId);
  }

  @Put(':id')
  @UseGuards(ProductOwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalog.updateProduct(id, dto);
  }

  @Delete(':id')
  @UseGuards(ProductOwnerGuard)
  remove(@Param('id') id: string) {
    return this.catalog.deleteProduct(id);
  }
}
