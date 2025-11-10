import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateOptionGroupDto } from './dto/create-option-group.dto.js';
import { UpdateOptionGroupDto } from './dto/update-option-group.dto.js';
import { CreateOptionDto } from './dto/create-option.dto.js';
import { UpdateOptionDto } from './dto/update-option.dto.js';
import { CategoryOwnerGuard } from '../../common/guards/category-owner.guard.js';
import { ProductOwnerGuard } from '../../common/guards/product-owner.guard.js';
import { OptionGroupOwnerGuard } from '../../common/guards/option-group-owner.guard.js';
import { OptionOwnerGuard } from '../../common/guards/option-owner.guard.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  listCategories(@Request() req: any) {
    const userId = req.headers['x-user-id'];
    const filterByOwner = req.query?.filterByOwner === 'true';
    return this.catalog.listCategories(filterByOwner && userId ? userId : undefined);
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto, @Request() req: any) {
    const userId = req.headers['x-user-id'];
    return this.catalog.createCategory(dto, userId);
  }

  @Put('categories/:id')
  @UseGuards(CategoryOwnerGuard)
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Request() req: any) {
    const userId = req.headers['x-user-id'];
    return this.catalog.updateCategory(id, dto, userId);
  }

  @Delete('categories/:id')
  @UseGuards(CategoryOwnerGuard)
  removeCategory(@Param('id') id: string) {
    return this.catalog.removeCategory(id);
  }

  @Get('products')
  listProducts(@Request() req: any) {
    const userId = req.headers['x-user-id'];
    const filterByOwner = req.query?.filterByOwner === 'true';
    return this.catalog.listProducts(filterByOwner && userId ? userId : undefined);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalog.getProduct(id);
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto, @Request() req: any) {
    const userId = req.headers['x-user-id'];
    return this.catalog.createProduct(dto, userId);
  }

  @Put('products/:id')
  @UseGuards(ProductOwnerGuard)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalog.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @UseGuards(ProductOwnerGuard)
  deleteProduct(@Param('id') id: string) {
    return this.catalog.deleteProduct(id);
  }

  @Post('option-groups')
  createOptionGroup(@Body() dto: CreateOptionGroupDto) {
    return this.catalog.createOptionGroup(dto);
  }

  @Put('option-groups/:id')
  @UseGuards(OptionGroupOwnerGuard)
  updateOptionGroup(@Param('id') id: string, @Body() dto: UpdateOptionGroupDto) {
    return this.catalog.updateOptionGroup(id, dto);
  }

  @Delete('option-groups/:id')
  @UseGuards(OptionGroupOwnerGuard)
  deleteOptionGroup(@Param('id') id: string) {
    return this.catalog.deleteOptionGroup(id);
  }

  @Post('options')
  createOption(@Body() dto: CreateOptionDto) {
    return this.catalog.createOption(dto);
  }

  @Put('options/:id')
  @UseGuards(OptionOwnerGuard)
  updateOption(@Param('id') id: string, @Body() dto: UpdateOptionDto) {
    return this.catalog.updateOption(id, dto);
  }

  @Delete('options/:id')
  @UseGuards(OptionOwnerGuard)
  deleteOption(@Param('id') id: string) {
    return this.catalog.deleteOption(id);
  }
}
